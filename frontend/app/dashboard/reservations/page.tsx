'use client';
import { useRole } from '@/contexts/RoleContext';
import { useApi } from '@/hooks/useApi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Car, Clock, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PARKING_ZONES } from '@/lib/constants';

export default function ReservationsPage() {
  const { currentUser } = useRole();
  const { getSessions, getActiveSessions } = useApi();

  const [sessions, setSessions]       = useState<any[]>([]);
  const [active, setActive]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Slots générés localement depuis les zones (pas d'API parking-slots)
  const slots = PARKING_ZONES.flatMap(zone => {
    const total = zone.rows * zone.cols;
    return Array.from({ length: total }, (_, i) => ({
      id: `${zone.id}-${i}`,
      zone: zone.id,
      number: `${zone.name}-${i + 1}`,
      is_pmr: zone.id === 'zone-e',
      status: ['available', 'reserved', 'occupied'][Math.floor(Math.random() * 3)] as string,
    }));
  });

  const available = slots.filter(s => s.status === 'available').length;
  const reserved  = slots.filter(s => s.status === 'reserved').length;
  const occupied  = slots.filter(s => s.status === 'occupied').length;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([getSessions(), getActiveSessions()]);
      setSessions(Array.isArray(s) ? s : []);
      setActive(Array.isArray(a) ? a : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!['employé', 'manager', 'administrateur'].includes(currentUser.role)) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-[#f43f5e] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Accès Refusé</h2>
        <p className="text-[#9ca3af]">Vous n&apos;avez pas accès à ce module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Parking & Sessions</h1>
          <p className="text-[#9ca3af]">État en temps réel des places et sessions véhicules</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#1f2937] hover:bg-[#2a2a2f] text-[#9ca3af] rounded-lg text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Disponibles', value: available, color: '#10b981', icon: Car },
          { label: 'Réservées',   value: reserved,  color: '#f59e0b', icon: Clock },
          { label: 'Occupées',    value: occupied,  color: '#06b6d4', icon: Car },
          { label: 'Sessions actives', value: loading ? '…' : active.length, color: '#f43f5e', icon: MapPin },
        ].map(s => (
          <Card key={s.label} className="bg-[#111114] border-[#1f2937] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9ca3af] text-xs font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan parking par zones */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Plan de Stationnement</h2>
        <div className="space-y-6">
          {PARKING_ZONES.map(zone => {
            const zoneSlots = slots.filter(s => s.zone === zone.id);
            return (
              <div key={zone.id} className="bg-[#09090b] rounded-lg p-4 border border-[#1f2937]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{zone.name}</h3>
                  <div className="flex gap-3 text-xs text-[#9ca3af]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981] inline-block"></span>{zoneSlots.filter(s=>s.status==='available').length} libres</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block"></span>{zoneSlots.filter(s=>s.status==='reserved').length} réservées</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6b7280] inline-block"></span>{zoneSlots.filter(s=>s.status==='occupied').length} occupées</span>
                  </div>
                </div>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${zone.cols}, minmax(0,1fr))` }}>
                  {zoneSlots.map(slot => (
                    <div key={slot.id} className={`aspect-square rounded flex items-center justify-center text-xs font-bold border ${
                      slot.status === 'available' ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                      : slot.status === 'reserved' ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b]'
                      : 'bg-[#6b7280]/20 border-[#6b7280] text-[#6b7280]'
                    }`}>
                      {slot.is_pmr ? '♿' : slot.number.split('-').pop()}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sessions récentes */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Sessions Récentes</h2>
          <Badge className="bg-[#1f2937] text-[#9ca3af]">{sessions.length} sessions</Badge>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-[#9ca3af]"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
        ) : error ? (
          <p className="text-[#f43f5e] text-sm">{error}</p>
        ) : sessions.length === 0 ? (
          <p className="text-[#9ca3af] text-sm">Aucune session enregistrée.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sessions.slice(0, 20).map((s: any) => (
              <div key={s.session_id ?? s.id} className="flex items-center justify-between p-3 bg-[#09090b] border border-[#1f2937] rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">{s.entry_ocr_raw ?? s.plate ?? '—'}</p>
                  <p className="text-[#9ca3af] text-xs">{new Date(s.entry_time).toLocaleString('fr-FR')}</p>
                </div>
                <Badge className={s.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#6b7280]/20 text-[#6b7280]'}>
                  {s.status === 'active' ? 'Actif' : 'Terminé'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
