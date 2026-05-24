'use client';
import { useRole } from '@/contexts/RoleContext';
import { useApi } from '@/hooks/useApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lock, RefreshCw, Save, Loader2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '@/lib/constants';

export default function AuditPage() {
  const { currentUser } = useRole();
  const { getAccessRights, getEmployees, getVehicles, createAccessRight } = useApi();

  const [accessRights, setAccessRights] = useState<any[]>([]);
  const [employees, setEmployees]       = useState<any[]>([]);
  const [vehicles, setVehicles]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [saveMsg, setSaveMsg]           = useState<string | null>(null);
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [cacheOk, setCacheOk]           = useState(true);

  const [form, setForm] = useState({
    vehicle_id: '',
    zone_id:    '',
    allowed_days: [1, 2, 3, 4, 5] as number[],
    start: '08:00',
    end:   '18:00',
    access_level: 'standard',
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ar, emp, veh] = await Promise.all([
        getAccessRights(),
        getEmployees(),
        getVehicles(),
      ]);
      setAccessRights(Array.isArray(ar)  ? ar  : []);
      setEmployees(Array.isArray(emp) ? emp : []);
      setVehicles(Array.isArray(veh)  ? veh : []);
      if (form.vehicle_id === '' && Array.isArray(veh) && veh.length > 0)
        setForm(f => ({ ...f, vehicle_id: veh[0].vehicle_id ?? veh[0].id ?? '' }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleDay = (day: number) => {
    setForm(f => ({
      ...f,
      allowed_days: f.allowed_days.includes(day)
        ? f.allowed_days.filter(d => d !== day)
        : [...f.allowed_days, day].sort(),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await createAccessRight({
        vehicle_id:   form.vehicle_id,
        zone_id:      form.zone_id || '00000000-0000-0000-0000-000000000000',
        allowed_days: form.allowed_days,
        allowed_hours: { start: form.start, end: form.end },
        access_level: form.access_level,
      });
      setSaveMsg('Droits enregistrés avec succès');
      load();
    } catch (e: any) {
      setSaveMsg(`Erreur : ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (currentUser.role !== 'administrateur') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-[#f43f5e] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Accès Refusé</h2>
        <p className="text-[#9ca3af]">Seuls les administrateurs peuvent accéder à ce module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Audit & Gestion des Droits</h1>
        <p className="text-[#9ca3af]">Gérez les droits d&apos;accès véhicules et consultez les journaux</p>
      </div>

      {/* Cache Status */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Statut Cache Redis</h2>
            <p className="text-[#9ca3af] text-sm">Permissions et configurations système</p>
          </div>
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${cacheOk ? 'bg-[#10b981]/20 border-[#10b981]' : 'bg-[#f59e0b]/20 border-[#f59e0b]'}`}>
            <span className="text-xl">{cacheOk ? '✓' : '⚠️'}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className={`text-sm font-semibold ${cacheOk ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
            {cacheOk ? 'Cache Valide' : 'Cache Invalidé'}
          </span>
          <Button
            onClick={() => { setCacheOk(false); setTimeout(() => setCacheOk(true), 3000); }}
            className="bg-[#10b981] hover:bg-[#059669] text-[#09090b] flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Invalider le Cache
          </Button>
        </div>
      </Card>

      {/* Formulaire droits d'accès */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Nouveau Droit d&apos;Accès</h2>

        {loading ? (
          <div className="flex items-center gap-2 text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement des données…
          </div>
        ) : error ? (
          <p className="text-[#f43f5e] text-sm">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#9ca3af] text-sm font-medium mb-2">Véhicule</label>
                <select
                  value={form.vehicle_id}
                  onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#1f2937] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
                >
                  {vehicles.map((v: any) => (
                    <option key={v.vehicle_id ?? v.id} value={v.vehicle_id ?? v.id}>
                      {v.plate ?? v.license_plate ?? v.vehicle_id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#9ca3af] text-sm font-medium mb-2">Niveau d&apos;accès</label>
                <select
                  value={form.access_level}
                  onChange={e => setForm(f => ({ ...f, access_level: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#1f2937] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="temporary">Temporaire</option>
                  <option value="emergency">Urgence</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#9ca3af] text-sm font-medium mb-2">Jours Autorisés</label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day, i) => {
                  const dayNum = i + 1;
                  const active = form.allowed_days.includes(dayNum);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(dayNum)}
                      className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        active
                          ? 'border-[#10b981] bg-[#10b981]/20 text-[#10b981]'
                          : 'border-[#1f2937] text-[#9ca3af] hover:border-[#10b981] hover:text-[#10b981]'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#9ca3af] text-sm font-medium mb-2">Heure Début</label>
                <input type="time" value={form.start}
                  onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#1f2937] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>
              <div>
                <label className="block text-[#9ca3af] text-sm font-medium mb-2">Heure Fin</label>
                <input type="time" value={form.end}
                  onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#1f2937] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>
            </div>

            {saveMsg && (
              <p className={`text-sm font-medium ${saveMsg.startsWith('Erreur') ? 'text-[#f43f5e]' : 'text-[#10b981]'}`}>
                {saveMsg}
              </p>
            )}

            <Button
              onClick={handleSave}
              disabled={saving || !form.vehicle_id}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : <><Save className="w-4 h-4" /> Enregistrer les Droits</>}
            </Button>
          </div>
        )}
      </Card>

      {/* Liste des droits existants */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Droits d&apos;Accès Existants</h2>
          <Badge className="bg-[#1f2937] text-[#9ca3af]">{accessRights.length} entrées</Badge>
        </div>
        {accessRights.length === 0 ? (
          <p className="text-[#9ca3af] text-sm">Aucun droit d&apos;accès configuré.</p>
        ) : (
          <div className="space-y-2">
            {accessRights.map((right: any) => (
              <div key={right.right_id ?? right.id} className="border border-[#1f2937] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === right.right_id ? null : right.right_id)}
                  className="w-full p-4 bg-[#09090b] hover:bg-[#111114] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Lock className="w-4 h-4 text-[#10b981]" />
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">
                        Véhicule : {right.vehicle_id}
                      </p>
                      <p className="text-[#9ca3af] text-xs">
                        Niveau : {right.access_level} • Jours : {(right.allowed_days || []).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={right.is_active ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#6b7280]/20 text-[#6b7280]'}>
                      {right.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <ChevronDown className={`w-4 h-4 text-[#9ca3af] transition-transform ${expanded === right.right_id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {expanded === right.right_id && (
                  <div className="bg-[#111114] border-t border-[#1f2937] p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#9ca3af] text-xs uppercase font-semibold mb-1">Heures</p>
                      <p className="text-white">{right.allowed_hours?.start} → {right.allowed_hours?.end}</p>
                    </div>
                    <div>
                      <p className="text-[#9ca3af] text-xs uppercase font-semibold mb-1">Créé le</p>
                      <p className="text-white">{new Date(right.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
