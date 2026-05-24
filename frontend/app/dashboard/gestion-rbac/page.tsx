'use client';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, Edit, Loader2, Users } from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { id: 'view_real_time',    name: 'Surveillance temps réel', description: 'Accès au flux OCR temps réel' },
  { id: 'view_security',     name: 'Alertes sécurité',        description: 'Voir les alertes de sécurité' },
  { id: 'manual_entry',      name: 'Entrée manuelle',         description: 'Forcer l\'ouverture barrière' },
  { id: 'view_analytics',    name: 'Analytics',               description: 'Accès aux rapports et analyses' },
  { id: 'generate_reports',  name: 'Générer rapports',        description: 'Créer des rapports personnalisés' },
  { id: 'reserve_parking',   name: 'Réserver parking',        description: 'Créer des réservations' },
  { id: 'cancel_reservation',name: 'Annuler réservation',     description: 'Annuler ses réservations' },
  { id: 'manage_rbac',       name: 'Gérer RBAC',              description: 'Gérer les rôles et permissions' },
  { id: 'manage_users',      name: 'Gérer utilisateurs',      description: 'Créer/modifier/supprimer utilisateurs' },
];

const ROLE_PERMS: Record<string, string[]> = {
  gardien:       ['view_real_time', 'view_security', 'manual_entry'],
  employe:       ['reserve_parking', 'cancel_reservation'],
  manager:       ['view_analytics', 'generate_reports', 'view_security'],
  admin:         AVAILABLE_PERMISSIONS.map(p => p.id),
};

const ROLE_LABELS: Record<string, string> = {
  gardien: 'Gardien', employe: 'Employé', manager: 'Manager', admin: 'Administrateur',
};

export default function GestionRBACPage() {
  const { getEmployees } = useApi();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('gardien');
  const [editMode, setEditMode]   = useState(false);
  const [perms, setPerms]         = useState<Record<string, string[]>>({ ...ROLE_PERMS });

  useEffect(() => {
    getEmployees()
      .then(d => setEmployees(Array.isArray(d) ? d : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const roleGroups = employees.reduce((acc: Record<string, any[]>, emp) => {
    const r = emp.role ?? 'employe';
    if (!acc[r]) acc[r] = [];
    acc[r].push(emp);
    return acc;
  }, {});

  const togglePerm = (perm: string) => {
    setPerms(p => ({
      ...p,
      [selectedRole]: p[selectedRole]?.includes(perm)
        ? p[selectedRole].filter(x => x !== perm)
        : [...(p[selectedRole] || []), perm],
    }));
  };

  const roles = Object.keys(ROLE_LABELS);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#10b981]" />
          Gestion RBAC
        </h1>
        <p className="text-[#9ca3af]">Rôles, permissions et utilisateurs du système</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des rôles */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white mb-4">Rôles</h2>
          {roles.map(role => (
            <Card
              key={role}
              onClick={() => { setSelectedRole(role); setEditMode(false); }}
              className={`bg-[#111114] border-[#1f2937] p-4 cursor-pointer transition-all ${
                selectedRole === role ? 'border-[#10b981] ring-1 ring-[#10b981]' : 'hover:border-[#2a2a2f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{ROLE_LABELS[role]}</h3>
                  <p className="text-xs text-[#9ca3af] mt-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {loading ? '…' : (roleGroups[role]?.length ?? 0)} utilisateurs
                  </p>
                </div>
                <Badge className="bg-[#10b981]/20 text-[#10b981]">
                  {(perms[role] || []).length} perms
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Détail rôle sélectionné */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#111114] border-[#1f2937] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{ROLE_LABELS[selectedRole]}</h2>
                <p className="text-[#9ca3af] text-sm mt-1">
                  {roleGroups[selectedRole]?.length ?? 0} utilisateurs assignés
                </p>
              </div>
              <Button
                onClick={() => setEditMode(!editMode)}
                className="bg-[#1f2937] hover:bg-[#2a2a2f] text-white flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {editMode ? 'Fermer' : 'Modifier'}
              </Button>
            </div>

            {/* Utilisateurs du rôle */}
            {loading ? (
              <div className="flex items-center gap-2 text-[#9ca3af] text-sm mb-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
              </div>
            ) : error ? (
              <p className="text-[#f43f5e] text-sm mb-4">{error}</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-[#1f2937]">
                {(roleGroups[selectedRole] || []).slice(0, 8).map((emp: any) => (
                  <span key={emp.employee_id} className="px-2 py-1 bg-[#09090b] border border-[#1f2937] rounded text-xs text-[#9ca3af]">
                    {emp.first_name} {emp.last_name}
                  </span>
                ))}
                {(roleGroups[selectedRole]?.length ?? 0) > 8 && (
                  <span className="px-2 py-1 bg-[#09090b] border border-[#1f2937] rounded text-xs text-[#9ca3af]">
                    +{(roleGroups[selectedRole]?.length ?? 0) - 8} autres
                  </span>
                )}
                {(roleGroups[selectedRole]?.length ?? 0) === 0 && (
                  <span className="text-xs text-[#6b7280]">Aucun utilisateur</span>
                )}
              </div>
            )}

            {/* Permissions */}
            <div className="space-y-2">
              {AVAILABLE_PERMISSIONS.map(perm => {
                const has = (perms[selectedRole] || []).includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    className={`p-3 rounded-lg border transition-all ${has ? 'border-[#10b981]/40 bg-[#10b981]/5' : 'border-[#1f2937] bg-[#09090b]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {has && <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />}
                        <div>
                          <p className="text-white text-sm font-medium">{perm.name}</p>
                          <p className="text-[#9ca3af] text-xs">{perm.description}</p>
                        </div>
                      </div>
                      {editMode && (
                        <Button
                          onClick={() => togglePerm(perm.id)}
                          className={`text-xs px-3 py-1 ml-2 flex-shrink-0 ${
                            has
                              ? 'bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20'
                              : 'bg-[#1f2937] text-white hover:bg-[#2a2a2f]'
                          }`}
                        >
                          {has ? 'Retirer' : 'Ajouter'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
