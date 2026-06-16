import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid and not default placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseAnonKey !== 'placeholder';

let client;
let usingMock = false;

if (isConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('🔌 Supabase initialized successfully.');
  } catch (err) {
    console.error('Error initializing Supabase client, falling back to Mock:', err);
    usingMock = true;
  }
} else {
  console.warn(
    '⚠️ Supabase credentials not configured or using placeholders. Falling back to Local Demo Database (localStorage).'
  );
  usingMock = true;
}

// Mock Supabase implementation for flawless offline/demo experience
const mockRealtimeCallbacks = [];

const mockClient = {
  from: (tableName) => {
    return {
      select: () => {
        const data = JSON.parse(localStorage.getItem(`deadzone_${tableName}`) || '[]');
        return Promise.resolve({ data, error: null });
      },
      insert: (rows) => {
        const data = JSON.parse(localStorage.getItem(`deadzone_${tableName}`) || '[]');
        const newRows = rows.map(r => ({
          id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2),
          timestamp: new Date().toISOString(),
          ...r
        }));
        const updated = [...data, ...newRows];
        localStorage.setItem(`deadzone_${tableName}`, JSON.stringify(updated));
        
        // Notify mock subscriptions asynchronously
        setTimeout(() => {
          newRows.forEach(row => {
            mockRealtimeCallbacks.forEach(cb => {
              cb({
                eventType: 'INSERT',
                new: row
              });
            });
          });
        }, 50);

        return Promise.resolve({ data: newRows, error: null });
      }
    };
  },
  channel: (channelName) => {
    return {
      on: (event, filter, callback) => {
        mockRealtimeCallbacks.push(callback);
        return {
          subscribe: () => {
            console.log(`[Mock Realtime] Subscribed to channel ${channelName}`);
            return {
              unsubscribe: () => {
                const index = mockRealtimeCallbacks.indexOf(callback);
                if (index !== -1) {
                  mockRealtimeCallbacks.splice(index, 1);
                  console.log(`[Mock Realtime] Unsubscribed from channel ${channelName}`);
                }
              }
            };
          }
        };
      }
    };
  }
};

export const supabase = usingMock ? mockClient : client;
export const isMockDatabase = usingMock;
