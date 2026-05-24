'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, AlertTriangle, Eye, Settings, Download, Filter, Zap } from 'lucide-react';
import Image from 'next/image';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastEvent: string;
  resolution: string;
  fps: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'entry' | 'exit' | 'alert' | 'plate_detected';
  plate: string;
  location: string;
  details: string;
}

const CAMERAS: Camera[] = [
  { id: 'cam-1', name: 'Entrée Principale', location: 'Zone A', status: 'online', lastEvent: '14:32:15', resolution: '1920x1080', fps: 30 },
  { id: 'cam-2', name: 'Sortie Principale', location: 'Zone A', status: 'online', lastEvent: '14:31:48', resolution: '1920x1080', fps: 30 },
  { id: 'cam-3', name: 'Sous-sol Niveau 1', location: 'Zone B', status: 'online', lastEvent: '14:28:32', resolution: '1280x720', fps: 25 },
  { id: 'cam-4', name: 'Sous-sol Niveau 2', location: 'Zone C', status: 'warning', lastEvent: '13:45:22', resolution: '1280x720', fps: 25 },
  { id: 'cam-5', name: 'Zone VIP', location: 'Zone VIP', status: 'online', lastEvent: '14:30:55', resolution: '2560x1440', fps: 30 },
  { id: 'cam-6', name: 'Ascenseur', location: 'Commun', status: 'offline', lastEvent: '12:15:00', resolution: '1920x1080', fps: 30 },
];

const SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'EVT-001', timestamp: '14:35:22', type: 'plate_detected', plate: 'AB-123-CD', location: 'Zone A', details: 'Entrée enregistrée' },
  { id: 'EVT-002', timestamp: '14:33:45', type: 'entry', plate: 'EF-456-GH', location: 'Zone A', details: 'Accès autorisé' },
  { id: 'EVT-003', timestamp: '14:31:10', type: 'alert', plate: 'XX-999-YY', location: 'Zone B', details: 'Plaque non reconnue' },
  { id: 'EVT-004', timestamp: '14:28:55', type: 'exit', plate: 'IJ-789-KL', location: 'Zone C', details: 'Sortie enregistrée' },
  { id: 'EVT-005', timestamp: '14:25:32', type: 'plate_detected', plate: 'MN-234-OP', location: 'Zone A', details: 'Entrée enregistrée' },
];

function getCameraStatusColor(status: string) {
  switch (status) {
    case 'online':
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400';
    case 'warning':
      return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400';
    case 'offline':
      return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400';
    default:
      return '';
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case 'plate_detected':
      return '🔍';
    case 'entry':
      return '📥';
    case 'exit':
      return '📤';
    case 'alert':
      return '⚠️';
    default:
      return '';
  }
}

export default function AdminSurveillancePage() {
  const [selectedCamera, setSelectedCamera] = useState<Camera>(CAMERAS[0]);
  const [filterType, setFilterType] = useState<string>('all');

  const onlineCameras = CAMERAS.filter(c => c.status === 'online').length;
  const filteredEvents = filterType === 'all' ? SECURITY_EVENTS : SECURITY_EVENTS.filter(e => e.type === filterType);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Eye className="w-8 h-8 text-red-600 dark:text-red-400" />
            Surveillance Multi-Caméras
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitoring avancé et logs de sécurité du parking
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
          <Radio className="w-4 h-4 animate-pulse" />
          EN DIRECT
        </button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Caméras Connectées</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{onlineCameras}/{CAMERAS.length}</p>
            </div>
            <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Événements (24h)</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{SECURITY_EVENTS.length}</p>
            </div>
            <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Alertes Actives</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">1</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Live Feed and Camera List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Camera Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] overflow-hidden">
            <div className="relative w-full aspect-video bg-slate-900">
              <Image
                src="https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=675&fit=crop"
                alt="Live surveillance feed"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-lg">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-white text-sm font-medium">EN DIRECT</span>
              </div>
              <div className="absolute bottom-4 left-4 text-white text-sm">
                <p className="font-semibold">{selectedCamera.name}</p>
                <p className="text-xs text-slate-300">{selectedCamera.location}</p>
              </div>
              <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
                {selectedCamera.resolution} @ {selectedCamera.fps}fps
              </div>
            </div>

            {/* Camera Controls */}
            <div className="p-4 bg-slate-50 dark:bg-[#0a0a0b] border-t border-slate-200 dark:border-[#1f2937] flex gap-2">
              <Button className="flex-1 bg-slate-200 dark:bg-[#1f2937] hover:bg-slate-300 dark:hover:bg-[#2a2a2f] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
              </Button>
              <Button className="flex-1 bg-slate-200 dark:bg-[#1f2937] hover:bg-slate-300 dark:hover:bg-[#2a2a2f] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <Settings className="w-4 h-4" />
              </Button>
              <Button className="flex-1 bg-slate-200 dark:bg-[#1f2937] hover:bg-slate-300 dark:hover:bg-[#2a2a2f] text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Camera List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Caméras</h2>
          {CAMERAS.map(camera => (
            <Card
              key={camera.id}
              onClick={() => setSelectedCamera(camera)}
              className={`bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-4 cursor-pointer transition-all ${
                selectedCamera.id === camera.id
                  ? 'border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500 dark:ring-emerald-600'
                  : 'hover:border-slate-300 dark:hover:border-[#2a2a2f]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{camera.name}</h3>
                <Badge className={getCameraStatusColor(camera.status)}>
                  {camera.status === 'online' ? '🟢' : camera.status === 'warning' ? '🟡' : '🔴'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{camera.location}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Vu: {camera.lastEvent}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Events */}
      <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Journal d'Événements</h2>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#1a1a1f] border border-slate-200 dark:border-[#2a2a2f] rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tous</option>
              <option value="plate_detected">Plaques détectées</option>
              <option value="entry">Entrées</option>
              <option value="exit">Sorties</option>
              <option value="alert">Alertes</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="p-4 bg-slate-50 dark:bg-[#0a0a0b] border border-slate-200 dark:border-[#1f2937] rounded-lg flex items-start gap-4"
            >
              <span className="text-2xl">{getEventIcon(event.type)}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{event.plate}</h4>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{event.timestamp}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{event.details}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
