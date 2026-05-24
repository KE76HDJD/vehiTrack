'use client';

import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, Trash2, Edit, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  zone: string;
  vehicle: string;
  licensePlate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalCost: number;
}

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-001',
    date: '2026-05-25',
    startTime: '09:00',
    endTime: '12:00',
    zone: 'Zone A - Entrée Principale',
    vehicle: 'Toyota Corolla 2022',
    licensePlate: 'AB-123-CD',
    status: 'active',
    totalCost: 7.5,
  },
  {
    id: 'RES-002',
    date: '2026-05-20',
    startTime: '14:00',
    endTime: '18:00',
    zone: 'Zone C - Sous-sol Niveau 2',
    vehicle: 'Peugeot 308 2021',
    licensePlate: 'EF-456-GH',
    status: 'completed',
    totalCost: 6.0,
  },
  {
    id: 'RES-003',
    date: '2026-05-15',
    startTime: '10:00',
    endTime: '11:00',
    zone: 'Zone B - Sous-sol Niveau 1',
    vehicle: 'Renault Scenic 2023',
    licensePlate: 'IJ-789-KL',
    status: 'cancelled',
    totalCost: 2.0,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">Active</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">Complétée</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">Annulée</Badge>;
    default:
      return null;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    default:
      return null;
  }
}

export default function MesReservationsPage() {
  const { currentUser } = useRole();
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const handleCancel = (id: string) => {
    setReservations(reservations.map(r => 
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    ));
  };

  const stats = {
    active: reservations.filter(r => r.status === 'active').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    totalSpent: reservations.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.totalCost, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Mes Réservations
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gérez et consultez vos réservations de parking
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Réservations Actives</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Complétées</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Annulées</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Montant Total</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.totalSpent.toFixed(2)}€</p>
            </div>
            <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'completed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-emerald-600 text-white dark:bg-emerald-600'
                : 'bg-slate-200 dark:bg-[#1f2937] text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-[#2a2a2f]'
            }`}
          >
            {status === 'all' ? 'Toutes' : status === 'active' ? 'Actives' : status === 'completed' ? 'Complétées' : 'Annulées'}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((reservation) => (
            <Card
              key={reservation.id}
              className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(reservation.status)}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{reservation.id}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{reservation.vehicle}</p>
                  </div>
                </div>
                {getStatusBadge(reservation.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-[#2a2a2f]">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">{reservation.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Durée</p>
                    <p className="font-medium text-slate-900 dark:text-white">{reservation.startTime} - {reservation.endTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Zone</p>
                    <p className="font-medium text-slate-900 dark:text-white">{reservation.zone}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Plaque: {reservation.licensePlate}</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{reservation.totalCost.toFixed(2)}€</p>
                </div>

                <div className="flex gap-2">
                  {reservation.status === 'active' && (
                    <>
                      <Button className="bg-slate-200 dark:bg-[#1f2937] hover:bg-slate-300 dark:hover:bg-[#2a2a2f] text-slate-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button 
                        onClick={() => handleCancel(reservation.id)}
                        className="bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Annuler
                      </Button>
                    </>
                  )}
                  {reservation.status !== 'active' && (
                    <Button className="bg-slate-200 dark:bg-[#1f2937] hover:bg-slate-300 dark:hover:bg-[#2a2a2f] text-slate-900 dark:text-white px-4 py-2 rounded-lg">
                      Détails
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">Aucune réservation trouvée</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Créez votre première réservation pour commencer</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
