/**
 * VehiTrack Pro - Centralized API Client
 * This client communicates with the 11 microservices via the Nginx proxy.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  timestamp: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'API request failed');
  }
  return data.data as T;
}

export const api = {
  // Auth & Identity
  auth: {
    login: (credentials: any) => 
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      }).then(handleResponse),
    
    getProfile: () => 
      fetch(`${API_BASE_URL}/identity/profile`).then(handleResponse),
  },

  // Vehicles
  vehicles: {
    list: () => fetch(`${API_BASE_URL}/vehicles/`).then(handleResponse),
    get: (id: string) => fetch(`${API_BASE_URL}/vehicles/${id}`).then(handleResponse),
  },

  // Sessions
  sessions: {
    listActive: () => fetch(`${API_BASE_URL}/sessions/active`).then(handleResponse),
    listHistory: () => fetch(`${API_BASE_URL}/sessions/`).then(handleResponse),
  },

  // Analytics
  analytics: {
    getOverview: () => fetch(`${API_BASE_URL}/analytics/overview`).then(handleResponse),
    getHeatmap: () => fetch(`${API_BASE_URL}/analytics/heatmap`).then(handleResponse),
  },

  // OCR
  ocr: {
    extract: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${API_BASE_URL}/ocr/extract`, {
        method: 'POST',
        body: formData
      }).then(handleResponse);
    }
  },

  // Dashboard Aggregator
  dashboard: {
    getStatus: () => fetch(`${API_BASE_URL}/dashboard/status-overview`).then(handleResponse),
  }
};
