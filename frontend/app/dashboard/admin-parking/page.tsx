'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, AlertTriangle, Settings, Plus, Edit, Trash2 } from 'lucide-react';

interface ParkingZone {
  id: string;
  name: string;
  totalSpaces: number;
  occupiedSpaces: number;
  reservedSpaces: number;
  availableSpaces: number;
  pricePerHour: number;
  status: 'operational' | 'maintenance' | 'closed';
  lastUpdated: string;
}

interface ParkingSpace {
  id: string;
  zoneId: string;
  spaceNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  occupant?: string;
  vehiclePlate?: string;
}

const PARKING_ZONES: ParkingZone[] = [
  {
    id: 'zone-a',
    name: 'Zone A - Entrée Principale',
    totalSpaces: 50,
    occupiedSpaces: 38,
    reservedSpaces: 8,
    availableSpaces: 4,
    pricePerHour: 2.5,
    status: 'operational',
    lastUpdated: '14:35:22',
  },
  {
    id: 'zone-b',
    name: 'Zone B - Sous-sol Niveau 1',
    totalSpaces: 75,
    occupiedSpaces: 62,
    reservedSpaces: 10,
    availableSpaces: 3,
    pricePerHour: 2.0,
    status: 'operational',
    lastUpdated: '14:34:15',
  },
  {
    id: 'zone-c',
    name: 'Zone C - Sous-sol Niveau 2',
    totalSpaces: 60,
    occupiedSpaces: 28,
    reservedSpaces: 12,
    availableSpaces: 20,
    pricePerHour: 1.5,
    status: 'operational',
    lastUpdated: '14:33:45',
  },
  {
    id: 'zone-vip',
    name: 'Zone VIP - Réservée',
    totalSpaces: 20,
    occupiedSpaces: 18,
    reservedSpaces: 2,
    availableSpaces: 0,
    pricePerHour: 5.0,
    status: 'operational',
    lastUpdated: '14:35:10',
  },
];

const MOCK_SPACES: ParkingSpace[] = [
  { id: 'sp-a-01', zoneId: 'zone-a', spaceNumber: 'A-001', status: 'occupied', occupant: 'Jean D.', vehiclePlate: 'AB-123-CD' },
  { id: 'sp-a-02', zoneId: 'zone-a', spaceNumber: 'A-002', status: 'available' },
  { id: 'sp-a-03', zoneId: 'zone-a', spaceNumber: 'A-003', status: 'reserved' },
  { id: 'sp-b-01', zoneId: 'zone-b', spaceNumber: 'B-001', status: 'occupied', occupant: 'Marie L.', vehiclePlate: 'EF-456-GH' },
  { id: 'sp-b-02', zoneId: 'zone-b', spaceNumber: 'B-002', status: 'maintenance' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'operational':
    case 'available':
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400';
    case 'maintenance':
      return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400';
    case 'closed':
    case 'occupied':
      return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400';
    case 'reserved':
      return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400';
    default:
      return '';
  }
}

export default function AdminParkingPage() {
  const [selectedZone, setSelectedZone] = useState<ParkingZone>(PARKING_ZONES[0]);
  const [showAddZone, setShowAddZone] = useState(false);

  const totalSpaces = PARKING_ZONES.reduce((sum, z) => sum + z.totalSpaces, 0);
  const totalOccupied = PARKING_ZONES.reduce((sum, z) => sum + z.occupiedSpaces, 0);
  const totalReserved = PARKING_ZONES.reduce((sum, z) => sum + z.reservedSpaces, 0);
  const totalAvailable = PARKING_ZONES.reduce((sum, z) => sum + z.availableSpaces, 0);
  const occupancyRate = Math.round((totalOccupied / totalSpaces) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Gestion Parking
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configuration complète des zones et places de parking
          </p>
        </div>
        <Button onClick={() => setShowAddZone(!showAddZone)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nouvelle Zone
        </Button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Places Totales</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalSpaces}</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Occupées</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{totalOccupied}</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Réservées</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalReserved}</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Disponibles</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalAvailable}</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Taux Occupation</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{occupancyRate}%</p>
          </div>
        </Card>
      </div>

      {/* Zones Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Zones de Parking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PARKING_ZONES.map(zone => {
            const occupancyPercent = Math.round((zone.occupiedSpaces / zone.totalSpaces) * 100);
            return (
              <Card
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6 cursor-pointer transition-all ${
                  selectedZone.id === zone.id
                    ? 'border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500 dark:ring-emerald-600'
                    : 'hover:border-slate-300 dark:hover:border-[#2a2a2f]'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{zone.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{zone.totalSpaces} places</p>
                  </div>
                  <Badge className={getStatusColor(zone.status)}>
                    {zone.status === 'operational' ? '✓' : '!'} {zone.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Status Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded">
                      <p className="text-xs text-red-700 dark:text-red-400 font-medium">Occupées</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{zone.occupiedSpaces}</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Réservées</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{zone.reservedSpaces}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Libres</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{zone.availableSpaces}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Taux occupation</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{occupancyPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#2a2a2f] rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">{zone.pricePerHour}€</span> /heure
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 pt-4 border-t border-slate-200 dark:border-[#2a2a2f]">
                  <Button className="flex-1 bg-slate-200 dark:bg-[#1f2937] hover:bg-slate-300 dark:hover:bg-[#2a2a2f] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                    <Edit className="w-3 h-3" />
                    Modifier
                  </Button>
                  <Button className="flex-1 bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Spaces de {selectedZone.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MOCK_SPACES.filter(s => s.zoneId === selectedZone.id).map(space => (
              <button
                key={space.id}
                className={`aspect-square rounded-lg border-2 font-semibold text-sm flex items-center justify-center transition-all hover:shadow-md ${
                  space.status === 'available'
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : space.status === 'occupied'
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                      : space.status === 'reserved'
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                        : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                }`}
              >
                <div className="text-center">
                  <p>{space.spaceNumber}</p>
                  <p className="text-xs opacity-70 mt-1">{space.status === 'occupied' ? '👤' : space.status === 'available' ? '✓' : space.status === 'reserved' ? '📌' : '🔧'}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Space Legend */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-[#2a2a2f] grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Occupée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Réservée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Maintenance</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
