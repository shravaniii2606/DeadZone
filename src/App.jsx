import { useCallback, useState, useEffect, useRef } from 'react';
import { Map, BarChart3, FileText, ShieldAlert } from 'lucide-react';

// Components
import PermissionScreen from './components/PermissionScreen';
import LandingScreen from './components/LandingScreen';
import MapScreen from './components/MapScreen';
import StatsScreen from './components/StatsScreen';
import AreaReport from './components/AreaReport';

// Utilities
import { supabase, isMockDatabase } from './utils/supabaseClient';
import { getHaversineDistance } from './utils/haversine';

// Helper: Query navigator.connection details
const getConnectionDetails = () => {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) {
    return {
      effectiveType: navigator.onLine ? '4g' : 'slow-2g',
      downlink: navigator.onLine ? 6.0 : 0.1,
      rtt: navigator.onLine ? 50 : 800,
    };
  }
  return {
    effectiveType: conn.effectiveType || '4g',
    downlink: typeof conn.downlink === 'number' ? conn.downlink : 6.0,
    rtt: typeof conn.rtt === 'number' ? conn.rtt : 50,
  };
};

// Helper: Map network telemetry to quality category
const mapConnectionToQuality = (conn) => {
  if (!navigator.onLine) return 'dead';

  const { effectiveType, downlink } = conn;

  if (effectiveType === '4g') {
    return downlink > 5 ? 'excellent' : 'good';
  } else if (effectiveType === '3g') {
    return 'moderate';
  } else if (effectiveType === '2g') {
    return 'weak';
  } else if (effectiveType === 'slow-2g') {
    return 'dead';
  }
  return 'dead';
};

export default function App() {
  // Navigation & Permission state
  const [hasStarted, setHasStarted] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'stats', 'report'

  // Logged readings
  const [readings, setReadings] = useState([]);
  const [sessionReadingsCount, setSessionReadingsCount] = useState(0);

  // User state
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Geolocation quality telemetry
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(null);

  // Connection telemetry
  const [currentConnectionDetails, setCurrentConnectionDetails] = useState(getConnectionDetails());
  const [currentQuality, setCurrentQuality] = useState(mapConnectionToQuality(getConnectionDetails()));

  // Logging status state & refs
  const [isLogging, setIsLogging] = useState(true);
  const lastLoggedPointRef = useRef(null);
  const watchIdRef = useRef(null);

  // Core logging save function
  const logSignalReading = useCallback(async (lat, lng, accuracy, speed) => {
    const conn = getConnectionDetails();
    const quality = mapConnectionToQuality(conn);

    const newReading = {
      lat,
      lng,
      accuracy,
      speed,
      effective_type: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      quality,
      timestamp: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('signal_readings').insert([newReading]);
      if (error) {
        console.error('Error inserting reading to Supabase:', error);
      } else {
        setSessionReadingsCount((count) => count + 1);
      }
    } catch (error) {
      console.error('Database insertion error:', error);
    }
  }, []);

  // 1. Initial Permission API Query
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'granted') {
          setHasPermission(true);
        }
        status.onchange = () => {
          setHasPermission(status.state === 'granted');
        };
      }).catch(err => {
        console.warn('Geolocation Permission Query not supported or failed:', err);
      });
    }
  }, []);

  // 2. Fetch Initial database readings & subscribe to Real-time insertions
  useEffect(() => {
    const fetchInitialReadings = async () => {
      try {
        const { data, error } = await supabase.from('signal_readings').select('*');
        if (error) {
          console.error('Error fetching database readings:', error);
        } else if (data) {
          setReadings(data);
        }
      } catch (err) {
        console.error('Supabase query crashed:', err);
      }
    };

    fetchInitialReadings();

    // Setup real-time updates channel
    const channel = supabase
      .channel('realtime-readings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'signal_readings' },
        (payload) => {
          const newReading = payload.new;
          setReadings((prev) => {
            // Prevent duplicate records
            if (prev.some((r) => r.id === newReading.id)) {
              return prev;
            }
            return [...prev, newReading];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // 3. Setup Connection change listeners
  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const handleConnectionChange = () => {
      const details = getConnectionDetails();
      setCurrentConnectionDetails(details);
      setCurrentQuality(mapConnectionToQuality(details));
    };

    // Listen to offline/online events for absolute connectivity checks
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      if (conn) {
        conn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  // 4. Geolocation Position Watcher Logic
  useEffect(() => {
    if (hasStarted && hasPermission && isLogging) {
      console.log('🔌 Geolocation tracking enabled');

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed } = position.coords;
          
          // Update visual position attributes immediately
          setUserLocation({ lat: latitude, lng: longitude });
          setGpsAccuracy(accuracy);
          setCurrentSpeed(speed);

          // Filtering Rules:
          // A: Skip if GPS accuracy is worse than 200 meters
          if (accuracy > 200) {
            console.warn(`[Logger] Skip: Accuracy poor (${accuracy.toFixed(1)}m > 200m)`);
            return;
          }

          // B: Skip if user speed exceeds 20 m/s (approx 72 km/h / driving)
          if (speed !== null && speed > 20) {
            console.warn(`[Logger] Skip: Driving detected (${speed.toFixed(1)}m/s > 20m/s)`);
            return;
          }

          // C: Skip if moved less than 10 meters from previous record
          const lastPoint = lastLoggedPointRef.current;
          if (lastPoint) {
            const distance = getHaversineDistance(
              lastPoint.lat,
              lastPoint.lng,
              latitude,
              longitude
            );
            
            if (distance < 10) {
              console.log(`[Logger] Skip: Distance moved is ${distance.toFixed(1)}m (< 10m threshold)`);
              return;
            }
          }

          // Log reading!
          console.log(`[Logger] Logging point (Moved: ${lastPoint ? '>=10m' : 'First reading'})`);
          lastLoggedPointRef.current = { lat: latitude, lng: longitude };
          
          logSignalReading(latitude, longitude, accuracy, speed);
        },
        (err) => {
          console.error('[Logger] WatchPosition error:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [hasStarted, hasPermission, isLogging, logSignalReading]);

  const handleToggleLogging = () => {
    setIsLogging((prev) => {
      const next = !prev;
      if (next) {
        // Reset reference so we capture a point immediately on logging restart
        lastLoggedPointRef.current = null;
      }
      return next;
    });
  };

  const handleSelectMapLocation = (latlng) => {
    setSelectedLocation(latlng);
    // Open drawer sheet on map, or let user switch tabs
  };

  if (!hasStarted) {
    return <LandingScreen onStart={() => setHasStarted(true)} />;
  }

  // If location permission has not been granted yet, show the onboarding screen
  if (!hasPermission) {
    return <PermissionScreen onRequestPermission={setHasPermission} />;
  }

  return (
    <div className="relative flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Demo Warning Banner if using mock database */}
      {isMockDatabase && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[10px] md:text-xs font-semibold text-amber-300 tracking-wide">
            USING LOCAL DEMO DATABASE — Configure .env variables for Supabase integration.
          </span>
        </div>
      )}

      {/* Screen Container */}
      <div className="flex-1 w-full relative overflow-hidden">
        {activeTab === 'map' && (
          <div className="w-full h-full relative">
            <MapScreen
              readings={readings}
              userLocation={userLocation}
              isLogging={isLogging}
              totalPointsMapped={readings.length}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectMapLocation}
              onRecenterMap={() => setSelectedLocation(null)}
            />
            {/* Draw AreaReport as bottom slide-up drawer on Map screen */}
            {selectedLocation && (
              <AreaReport
                selectedLocation={selectedLocation}
                readings={readings}
                onClose={() => setSelectedLocation(null)}
                isDrawer={true}
              />
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <StatsScreen
            isLogging={isLogging}
            onToggleLogging={handleToggleLogging}
            sessionReadingsCount={sessionReadingsCount}
            currentQuality={currentQuality}
            gpsAccuracy={gpsAccuracy}
            currentSpeed={currentSpeed}
            currentConnectionDetails={currentConnectionDetails}
          />
        )}

        {activeTab === 'report' && (
          <AreaReport
            selectedLocation={selectedLocation || userLocation}
            readings={readings}
            onClose={selectedLocation ? () => setSelectedLocation(null) : null}
            isDrawer={false}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-slate-900 flex items-center justify-around py-3 px-2 shadow-2xl">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            activeTab === 'map' ? 'text-sky-400 scale-105 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Map className="w-5.5 h-5.5" />
          <span className="text-[10px] tracking-wide uppercase">Map</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            activeTab === 'stats' ? 'text-emerald-400 scale-105 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-5.5 h-5.5" />
          <span className="text-[10px] tracking-wide uppercase">Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            activeTab === 'report' ? 'text-teal-400 scale-105 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileText className="w-5.5 h-5.5" />
          <span className="text-[10px] tracking-wide uppercase">Report</span>
        </button>
      </nav>
    </div>
  );
}
