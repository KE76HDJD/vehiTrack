import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import {
  VehicleSession,
  AuditLog,
  ParkingSlot,
  Reservation,
  HeatmapData,
  OccupancyRecord,
  DurationRecord,
} from '@/types';

export function useData() {
  const { getSessions, getActiveSessions } = useApi();

  const [sessions, setSessions]         = useState<VehicleSession[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [heatmapData, setHeatmapData]   = useState<HeatmapData[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyRecord[]>([]);
  const [durationData, setDurationData] = useState<DurationRecord[]>([]);
  const [auditLogs, setAuditLogs]       = useState<AuditLog[]>([]);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data: VehicleSession[] = await getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return {
    sessions,
    reservations,
    heatmapData,
    occupancyData,
    durationData,
    auditLogs,
    parkingSlots,
    loading,
    error,
    refresh: fetchData,
  };
}
