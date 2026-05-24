import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketEvent } from '@/types';

const MOCK_PLATES = ['ABC-123', 'DEF-456', 'GHI-789', 'JKL-012', 'MNO-345', 'PQR-678', 'STU-901', 'VWX-234'];
const MOCK_ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

function generateMockEvent(): WebSocketEvent {
  const types: Array<WebSocketEvent['type']> = ['entry', 'exit', 'alert'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let severity: WebSocketEvent['severity'] = 'info';
  if (type === 'alert') {
    const severities: Array<WebSocketEvent['severity']> = ['warning', 'critical'];
    severity = severities[Math.floor(Math.random() * severities.length)];
  }

  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    vehicle_plate: MOCK_PLATES[Math.floor(Math.random() * MOCK_PLATES.length)],
    confidence: type === 'alert' ? (0.5 + Math.random() * 0.4) : (0.85 + Math.random() * 0.15),
    zone: MOCK_ZONES[Math.floor(Math.random() * MOCK_ZONES.length)],
    severity,
  };
}

export function useWebSocket(enabled = true) {
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Simulate connection
    setIsConnected(true);

    // Generate mock events every 2-3 seconds
    intervalRef.current = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents((prev) => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
    }, 2000 + Math.random() * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsConnected(false);
    };
  }, [enabled]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    clearEvents,
  };
}
