'use client';
import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useApi } from '@/hooks/useApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';

const ROLES = [
  { value: 'employe', label: 'Employé' },
  { value: 'gardien', label: 'Gardien' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin',   label: 'Administrateur' },
];

export default function CreateEmployeePage() {
  const { currentUser } = useRole();
  const { createEmployee } = useApi();

  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employe',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentUser.role !== 'administrateur') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-[#f43f5e] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Accès Refusé</h2>
        <p className="text-[#9ca3af]">Seuls les administrateurs peuvent créer des comptes.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createEmployee({
        ...form,
        phone: form.phone || undefined,
      });
      setSuccess(true);
      setForm({ email: '', password: '', first_name: '', last_name: '', role: 'employe', phone: '' });
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.email && form.password && form.first_name && form.last_name;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <UserPlus className="w-7 h-7 text-[#10b981]" />
          Créer un Compte Employé
        </h1>
        <p className="text-[#9ca3af]">Ajoutez un nouvel utilisateur au système VehiTrack</p>
      </div>

      <Card className="bg-[#111114] border-[#1f2937] p-6 space-y-5">
        {/* Nom / Prénom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#9ca3af] text-sm font-medium mb-2">Prénom *</label>
            <input
              type="text"
              value={form.first_name}
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              placeholder="Kossi"
              className="w-full px-4 py-2.5 bg-[#09090b] border border-[#1f2937] rounded-lg text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#9ca3af] text-sm font-medium mb-2">Nom *</label>
            <input
              type="text"
              value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              placeholder="Mensah"
              className="w-full px-4 py-2.5 bg-[#09090b] border border-[#1f2937] rounded-lg text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[#9ca3af] text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="kossi.mensah@vehitrack.io"
            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#1f2937] rounded-lg text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] transition-colors"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-[#9ca3af] text-sm font-medium mb-2">Mot de passe *</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#1f2937] rounded-lg text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] transition-colors"
          />
        </div>

        {/* Rôle */}
        <div>
          <label className="block text-[#9ca3af] text-sm font-medium mb-2">Rôle *</label>
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#1f2937] rounded-lg text-white focus:outline-none focus:border-[#10b981] transition-colors"
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-[#9ca3af] text-sm font-medium mb-2">
            Téléphone <span className="text-[#6b7280]">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+228 90 00 00 00"
            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#1f2937] rounded-lg text-white placeholder-[#4b5563] focus:outline-none focus:border-[#10b981] transition-colors"
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-[#f43f5e] flex-shrink-0" />
            <p className="text-[#f43f5e] text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
            <p className="text-[#10b981] text-sm">Compte créé avec succès !</p>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Création en cours...</>
          ) : (
            <><UserPlus className="w-4 h-4" /> Créer le compte</>
          )}
        </Button>
      </Card>
    </div>
  );
}
