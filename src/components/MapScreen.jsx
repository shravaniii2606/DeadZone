import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, ShieldAlert, Wifi, Navigation } from 'lucide-react';

const QUALITY_COLORS = {
  excellent: '#10B981', // Emerald Green
  good: '#34D399',      // Mint Green
  moderate: '#F59E0B',  // Amber Yellow
  weak: '#EF4444',      // Orange-Red
  dead: '#991B1B',      // Crimson/Dark Red
};

export default function MapScreen({
  readings,
  userLocation,
  isLogging,
  totalPointsMapped,
  selectedLocation,
  onSelectLocation,
  onRecenterMap,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const selectionCircleRef = useRef(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = userLocation?.lat || 0;
    const initialLng = userLocation?.lng || 0;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      maxZoom: 18,
      minZoom: 3,
    }).setView([initialLat, initialLng], 16);

    // Dark Theme Tiles - CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Zoom control in top right (keeps bottom clear for status/navigation)
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Create marker layers
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    mapRef.current = map;

    // Tap/Click handler on map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onSelectLocation({ lat, lng });
    });

    // Cleanup map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Center map on user location if coordinates change initially (or on recenter)
  useEffect(() => {
    if (mapRef.current && userLocation && !selectedLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation?.lat, userLocation?.lng]);

  // 3. Render Signal readings on Map
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    readings.forEach((reading) => {
      const color = QUALITY_COLORS[reading.quality] || '#94A3B8';
      
      const circleMarker = L.circleMarker([reading.lat, reading.lng], {
        radius: 8,
        fillColor: color,
        fillOpacity: 0.85,
        color: '#020617', // Dark border
        weight: 1.5,
      });

      // Add descriptive popup
      const dateStr = new Date(reading.timestamp).toLocaleTimeString();
      const speedStr = reading.speed ? `${(reading.speed * 3.6).toFixed(1)} km/h` : 'N/A';
      const downlinkStr = reading.downlink ? `${reading.downlink} Mbps` : 'N/A';
      
      circleMarker.bindPopup(`
        <div class="p-1 font-sans text-slate-100">
          <div class="flex items-center gap-1.5 font-bold mb-1">
            <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${color}"></span>
            <span class="capitalize text-sm">${reading.quality} Signal</span>
          </div>
          <div class="text-xs space-y-0.5 text-slate-300">
            <div>Type: <span class="font-semibold text-white">${reading.effective_type || 'Unknown'}</span></div>
            <div>Speed: <span class="font-semibold text-white">${downlinkStr}</span></div>
            <div>RTT: <span class="font-semibold text-white">${reading.rtt ? reading.rtt + ' ms' : 'N/A'}</span></div>
            <div>GPS Acc: <span class="font-semibold text-white">${reading.accuracy ? reading.accuracy.toFixed(1) + 'm' : 'N/A'}</span></div>
            <div class="text-[10px] text-slate-500 mt-1">${dateStr}</div>
          </div>
        </div>
      `, {
        className: 'leaflet-dark-popup',
        closeButton: false,
      });

      markersGroupRef.current.addLayer(circleMarker);
    });
  }, [readings]);

  // 4. Track User Location Marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const latlng = [userLocation.lat, userLocation.lng];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latlng);
    } else {
      // Create user marker
      const userMarkerIcon = L.divIcon({
        className: 'map-user-marker',
        html: `<div class="w-3.5 h-3.5 bg-sky-400 border border-white rounded-full shadow-lg shadow-sky-500/50"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      userMarkerRef.current = L.marker(latlng, { icon: userMarkerIcon }).addTo(mapRef.current);
    }
  }, [userLocation?.lat, userLocation?.lng]);

  // 5. Track Tapped Selected Coordinates (Area Report Center)
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedLocation) {
      const latlng = [selectedLocation.lat, selectedLocation.lng];

      // Draw or update 100m query circle
      if (selectionCircleRef.current) {
        selectionCircleRef.current.setLatLng(latlng);
      } else {
        selectionCircleRef.current = L.circle(latlng, {
          radius: 100,
          color: '#38bdf8', // sky-400
          weight: 1.5,
          fillColor: '#38bdf8',
          fillOpacity: 0.15,
          dashArray: '5, 5',
        }).addTo(mapRef.current);
      }
    } else {
      // Clear selection circle
      if (selectionCircleRef.current) {
        selectionCircleRef.current.remove();
        selectionCircleRef.current = null;
      }
    }
  }, [selectedLocation]);

  // Floating center map action
  const handleRecenter = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
      if (onRecenterMap) onRecenterMap();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map CSS Custom Popup styling */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.9) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Floating Buttons */}
      {userLocation && (
        <button
          onClick={handleRecenter}
          className="absolute right-4 bottom-20 z-10 p-3.5 rounded-full bg-slate-900/90 border border-slate-800 text-sky-400 hover:text-sky-300 shadow-xl shadow-black/40 hover:bg-slate-800/90 active:scale-95 transition-all duration-150"
          title="Recenter Map"
        >
          <Navigation className="w-5 h-5 fill-current" />
        </button>
      )}

      {/* Bottom Status Bar */}
      <div className="absolute left-4 right-4 bottom-4 z-10 glass-panel py-3 px-4 rounded-xl flex items-center justify-between shadow-xl shadow-black/30 pointer-events-auto">
        <div className="flex items-center gap-2">
          {isLogging ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                LOGGING ACTIVE
              </span>
            </>
          ) : (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
              <span className="text-xs font-semibold text-slate-400 tracking-wide">
                LOGGING STOPPED
              </span>
            </>
          )}
        </div>
        <div className="text-xs text-slate-300 font-medium">
          <span className="text-emerald-400 font-bold">{totalPointsMapped}</span> points mapped
        </div>
      </div>
    </div>
  );
}
