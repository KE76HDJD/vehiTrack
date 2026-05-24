// Role definitions
export type UserRole = 'gardien' | 'manager' | 'employé' | 'administrateur';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

// Vehicle and Session types
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface VehicleSession {
  id: string;
  vehicle_id: string;
  entry_time: string;
  exit_time?: string;
  entry_plate_confidence: number;
  entry_ocr_raw: string;
  status: 'active' | 'completed';
}

// Reservation types
export interface ParkingSlot {
  id: string;
  zone: string;
  number: string;
  is_pmr: boolean;
  status: 'available' | 'reserved' | 'occupied';
}

export interface Reservation {
  id: string;
  user_id: string;
  slot_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
}

// Audit and Access types
export interface AccessRight {
  id: string;
  vehicle_id: string;
  employee_id: string;
  allowed_days: number[];
  allowed_hours: { start: string; end: string };
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  resource: string;
  resource_id: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  created_at: string;
}

// Analytics types
export interface HeatmapData {
  day: number;
  hour: number;
  count: number;
}

export interface OccupancyRecord {
  timestamp: string;
  occupied_slots: number;
  capacity_percentage: number;
}

export interface DurationRecord {
  duration_minutes: number;
  count: number;
  is_anomaly: boolean;
}

// Report types
export interface Report {
  id: string;
  generated_at: string;
  start_date: string;
  end_date: string;
  download_url: string;
  expires_at: string;
}

// WebSocket event types
export interface WebSocketEvent {
  id: string;
  type: 'entry' | 'exit' | 'alert';
  timestamp: string;
  vehicle_plate: string;
  confidence: number;
  zone?: string;
  severity?: 'info' | 'warning' | 'critical';
}
