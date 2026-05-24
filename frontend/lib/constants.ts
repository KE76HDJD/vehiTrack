import { UserRole } from '@/types';

// Color system
export const COLORS = {
  background: '#09090b',
  foreground: '#fafafa',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  slate: {
    700: '#374151',
    600: '#4b5563',
    500: '#6b7280',
    400: '#9ca3af',
  },
};

// Role definitions and permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  gardien: [
    'view_real_time',
    'view_security',
    'manual_entry',
    'force_barrier',
    'acknowledge_alerts',
  ],
  manager: [
    'view_analytics',
    'view_occupancy',
    'generate_reports',
    'view_audit_logs',
    'view_security',
  ],
  employé: [
    'view_parking',
    'make_reservation',
    'cancel_reservation',
    'view_my_bookings',
  ],
  administrateur: [
    'manage_rbac',
    'manage_cache',
    'view_audit_logs',
    'full_access',
  ],
};

// Role display information
export const ROLE_INFO: Record<UserRole, { label: string; description: string }> = {
  gardien: {
    label: 'Gardien',
    description: 'Surveillance temps réel et contrôle d\'accès',
  },
  manager: {
    label: 'Manager',
    description: 'Analyses et rapports',
  },
  employé: {
    label: 'Employé',
    description: 'Réservations et stationnement',
  },
  administrateur: {
    label: 'Administrateur',
    description: 'Gestion des droits et audit',
  },
};

// Parking zones
export const PARKING_ZONES = [
  { id: 'zone-a', name: 'Zone A', rows: 5, cols: 6 },
  { id: 'zone-b', name: 'Zone B', rows: 5, cols: 6 },
  { id: 'zone-c', name: 'Zone C', rows: 4, cols: 6 },
  { id: 'zone-d', name: 'Zone D', rows: 5, cols: 5 },
  { id: 'zone-e', name: 'Zone E (PMR)', rows: 2, cols: 4 },
];

// Alert severity colors
export const SEVERITY_COLORS = {
  info: { bg: '#dbeafe', text: '#0369a1', border: '#0284c7' },
  warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  critical: { bg: '#fee2e2', text: '#991b1b', border: '#f43f5e' },
};

// Days of week
export const DAYS_OF_WEEK = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

// Navigation modules per role
export const ROLE_MODULES: Record<UserRole, Array<{ label: string; href: string; icon: string }>> = {
  gardien: [
    { label: 'Surveillance Temps Réel', href: '/dashboard/real-time', icon: '📹' },
    { label: 'Alertes de Sécurité', href: '/dashboard/audit', icon: '🚨' },
  ],
  manager: [
    { label: 'Analytics & Rapports', href: '/dashboard/analytics', icon: '📊' },
    { label: 'Parking & Réservations', href: '/dashboard/reservations', icon: '🅿️' },
  ],
  employé: [
    { label: 'Nouvelle Réservation', href: '/dashboard/reservations-new', icon: '🎫' },
    { label: 'Mes Réservations', href: '/dashboard/mes-reservations', icon: '📋' },
  ],
  administrateur: [
    { label: 'Gestion RBAC', href: '/dashboard/gestion-rbac', icon: '🔐' },
    { label: 'Analytics & Rapports', href: '/dashboard/admin-analytics', icon: '📊' },
    { label: 'Surveillance Multi-Caméras', href: '/dashboard/admin-surveillance', icon: '📹' },
    { label: 'Gestion Parking', href: '/dashboard/admin-parking', icon: '🅿️' },
  ],
};
