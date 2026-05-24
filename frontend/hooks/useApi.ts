import { useCallback } from 'react';

const SERVICES = {
  auth:    'http://localhost:8001',
  identity:'http://localhost:8002',
  vehicle: 'http://localhost:8003',
  access:  'http://localhost:8004',
  session: 'http://localhost:8007',
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expirée');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Erreur ${res.status}`);
  }

  const json = await res.json();
  // Unwrap APIResponse { success, data } ou retourne directement
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export function useApi() {
  // ── IDENTITY :8002 ──────────────────────────────────────────
  const getMe = useCallback(() =>
    apiFetch<any>(`${SERVICES.identity}/api/v1/auth/me`), []);

  const getEmployees = useCallback(() =>
    apiFetch<any[]>(`${SERVICES.identity}/api/v1/employees/`), []);

  const createEmployee = useCallback((data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
  }) => apiFetch<any>(`${SERVICES.identity}/api/v1/employees/`, {
    method: 'POST',
    body: JSON.stringify(data),
  }), []);

  // ── VEHICLE :8003 ────────────────────────────────────────────
  const getVehicles = useCallback(() =>
    apiFetch<any[]>(`${SERVICES.vehicle}/api/v1/vehicles/`), []);

  // ── SESSION :8007 ────────────────────────────────────────────
  const getSessions = useCallback(() =>
    apiFetch<any[]>(`${SERVICES.session}/api/v1/sessions/`), []);

  const getActiveSessions = useCallback(() =>
    apiFetch<any[]>(`${SERVICES.session}/api/v1/sessions/active`), []);

  // ── ACCESS CONTROL :8004 ─────────────────────────────────────
  const getAccessRights = useCallback(() =>
    apiFetch<any[]>(`${SERVICES.access}/api/v1/access-rights/`), []);

  const createAccessRight = useCallback((data: {
    vehicle_id: string;
    zone_id: string;
    allowed_days: number[];
    allowed_hours: { start: string; end: string };
    access_level?: string;
  }) => apiFetch<any>(`${SERVICES.access}/api/v1/access-rights/`, {
    method: 'POST',
    body: JSON.stringify(data),
  }), []);

  return {
    getMe,
    getEmployees,
    createEmployee,
    getVehicles,
    getSessions,
    getActiveSessions,
    getAccessRights,
    createAccessRight,
  };
}
