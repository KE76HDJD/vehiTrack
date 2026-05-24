import { useState, useEffect, useCallback } from 'react';
import {
  VehicleSession,
  Reservation,
  HeatmapData,
  OccupancyRecord,
  DurationRecord,
  AuditLog,
  ParkingSlot,
} from '@/types';
import { PARKING_ZONES } from '@/lib/constants';

// Generate mock vehicle sessions
const generateMockSessions = (): VehicleSession[] => {
  const sessions: VehicleSession[] = [];
  const plates = ['ABC-123', 'DEF-456', 'GHI-789', 'JKL-012', 'MNO-345'];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const entryTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const exitTime = Math.random() > 0.3 ? new Date(entryTime.getTime() + Math.random() * 8 * 60 * 60 * 1000) : undefined;

    sessions.push({
      id: `session-${i}`,
      vehicle_id: `vehicle-${i % 5}`,
      entry_time: entryTime.toISOString(),
      exit_time: exitTime?.toISOString(),
      entry_plate_confidence: 0.85 + Math.random() * 0.15,
      entry_ocr_raw: plates[i % 5],
      status: exitTime ? 'completed' : 'active',
    });
  }

  return sessions;
};

// Generate mock reservations
const generateMockReservations = (): Reservation[] => {
  const now = new Date();
  const reservations: Reservation[] = [];

  for (let i = 0; i < 8; i++) {
    const startTime = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + (2 + Math.random() * 6) * 60 * 60 * 1000);

    reservations.push({
      id: `reservation-${i}`,
      user_id: 'user-3',
      slot_id: `slot-${Math.floor(Math.random() * 120)}`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      created_at: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: i < 3 ? 'active' : 'completed',
    });
  }

  return reservations;
};

// Generate mock heatmap data
const generateMockHeatmap = (): HeatmapData[] => {
  const data: HeatmapData[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      data.push({
        day,
        hour,
        count: Math.floor(Math.random() * 150),
      });
    }
  }

  return data;
};

// Generate mock occupancy data
const generateMockOccupancy = (): OccupancyRecord[] => {
  const data: OccupancyRecord[] = [];
  const now = new Date();

  for (let i = 0; i < 96; i++) {
    const timestamp = new Date(now.getTime() - (96 - i) * 15 * 60 * 1000).toISOString();
    data.push({
      timestamp,
      occupied_slots: Math.floor(80 + Math.random() * 120),
      capacity_percentage: 40 + Math.random() * 60,
    });
  }

  return data;
};

// Generate mock duration data
const generateMockDuration = (): DurationRecord[] => {
  const data: DurationRecord[] = [];
  const durations = [30, 60, 120, 180, 240, 360, 480, 720];

  durations.forEach((duration) => {
    data.push({
      duration_minutes: duration,
      count: Math.floor(Math.random() * 50 + 10),
      is_anomaly: Math.random() > 0.7,
    });
  });

  return data;
};

// Generate mock audit logs
const generateMockAuditLogs = (): AuditLog[] => {
  const logs: AuditLog[] = [];
  const actions = [
    'RBAC_UPDATED',
    'CACHE_INVALIDATED',
    'REPORT_GENERATED',
    'RESERVATION_CREATED',
    'ACCESS_DENIED',
  ];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    logs.push({
      id: `audit-${i}`,
      actor_id: `user-${Math.floor(Math.random() * 4) + 1}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: ['vehicle', 'reservation', 'rbac'][Math.floor(Math.random() * 3)],
      resource_id: `resource-${i}`,
      old_value: { status: 'active' },
      new_value: { status: 'inactive' },
      created_at: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
    });
  }

  return logs;
};

// Generate mock parking slots
const generateMockParkingSlots = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  let slotId = 0;

  PARKING_ZONES.forEach((zone) => {
    const totalSlots = zone.rows * zone.cols;
    for (let i = 0; i < totalSlots; i++) {
      const statuses = ['available', 'reserved', 'occupied'] as const;
      slots.push({
        id: `slot-${slotId}`,
        zone: zone.id,
        number: `${zone.name}-${i + 1}`,
        is_pmr: zone.id === 'zone-e',
        status: statuses[Math.floor(Math.random() * 3)],
      });
      slotId++;
    }
  });

  return slots;
};

export function useMockData() {
  const [sessions, setSessions] = useState<VehicleSession[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyRecord[]>([]);
  const [durationData, setDurationData] = useState<DurationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);

  useEffect(() => {
    setSessions(generateMockSessions());
    setReservations(generateMockReservations());
    setHeatmapData(generateMockHeatmap());
    setOccupancyData(generateMockOccupancy());
    setDurationData(generateMockDuration());
    setAuditLogs(generateMockAuditLogs());
    setParkingSlots(generateMockParkingSlots());
  }, []);

  const addNewSession = useCallback((session: VehicleSession) => {
    setSessions((prev) => [session, ...prev]);
  }, []);

  const updateReservation = useCallback((id: string, updates: Partial<Reservation>) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, ...updates } : res))
    );
  }, []);

  return {
    sessions,
    reservations,
    heatmapData,
    occupancyData,
    durationData,
    auditLogs,
    parkingSlots,
    addNewSession,
    updateReservation,
  };
}
