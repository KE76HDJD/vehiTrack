'use client';

import { useRole } from '@/contexts/RoleContext';
import { useMockData } from '@/hooks/useMockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeatmapMatrix } from '@/components/analytics/HeatmapMatrix';
import { AlertTriangle, BarChart3, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { currentUser } = useRole();
  const { occupancyData, durationData } = useMockData();

  // Check if user has access to this page
  if (!['manager', 'administrateur'].includes(currentUser.role)) {
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Rapports</h1>
        <p className="text-[#9ca3af]">Analyse détaillée des données de stationnement et flux de véhicules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111114] border-[#1f2937] p-6">
          <p className="text-[#9ca3af] text-sm mb-2">Taux d&apos;Occupation Moyen</p>
          <p className="text-3xl font-bold text-[#10b981]">62.5%</p>
          <p className="text-[#9ca3af] text-xs mt-2">↑ 5% depuis hier</p>
        </Card>
        <Card className="bg-[#111114] border-[#1f2937] p-6">
          <p className="text-[#9ca3af] text-sm mb-2">Durée Moyenne Stationnement</p>
          <p className="text-3xl font-bold text-[#06b6d4]">3h 42m</p>
          <p className="text-[#9ca3af] text-xs mt-2">Stable</p>
        </Card>
        <Card className="bg-[#111114] border-[#1f2937] p-6">
          <p className="text-[#9ca3af] text-sm mb-2">Véhicules Aujourd&apos;hui</p>
          <p className="text-3xl font-bold text-[#f59e0b]">247</p>
          <p className="text-[#9ca3af] text-xs mt-2">+12 depuis hier</p>
        </Card>
      </div>

      {/* Heatmap */}
      <HeatmapMatrix />

      {/* Occupancy Chart */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Taux d&apos;Occupation (24h)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={occupancyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="timestamp"
              stroke="#9ca3af"
              tickFormatter={(time) => new Date(time).toLocaleTimeString('fr-FR', { hour: '2-digit' })}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111114',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                color: '#fafafa',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="occupied_slots"
              stroke="#10b981"
              name="Places Occupées"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="capacity_percentage"
              stroke="#06b6d4"
              name="% Capacité"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Duration Histogram */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Distribution des Durées de Stationnement</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={durationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="duration_minutes" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111114',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                color: '#fafafa',
              }}
            />
            <Bar
              dataKey="count"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
              name="Nombre de Sessions"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Report Generator */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Générer un Rapport</h2>
            <p className="text-[#9ca3af] text-sm">
              Créez un rapport PDF personnalisé avec les données de stationnement
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-[#10b981]" />
        </div>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9ca3af] text-sm font-medium mb-2">
                Date de Début
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#1f2937] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-[#9ca3af] text-sm font-medium mb-2">
                Date de Fin
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#1f2937] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#10b981]"
              />
            </div>
          </div>
          <Button className="w-full bg-[#10b981] text-[#09090b] hover:bg-[#059669] py-6 text-base font-semibold">
            <Download className="w-4 h-4 mr-2" />
            Générer Rapport PDF (Async)
          </Button>
        </div>
      </Card>

      {/* Recent Reports */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Rapports Récents</h2>
        <div className="space-y-2">
          {[
            { id: 1, date: '2024-01-15', status: 'Téléchargeable', valid: 'Valide 7 jours' },
            { id: 2, date: '2024-01-14', status: 'Téléchargeable', valid: 'Valide 6 jours' },
            { id: 3, date: '2024-01-13', status: 'Expiré', valid: 'Lien expiré' },
          ].map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 bg-[#09090b] border border-[#1f2937] rounded-lg">
              <div className="flex-1">
                <p className="text-white font-medium">Rapport du {report.date}</p>
                <p className="text-[#9ca3af] text-sm">{report.valid}</p>
              </div>
              {report.status === 'Téléchargeable' ? (
                <Button size="sm" className="bg-[#10b981] text-[#09090b] hover:bg-[#059669]">
                  <Download className="w-4 h-4" />
                </Button>
              ) : (
                <span className="text-[#f43f5e] text-sm font-medium">Expiré</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
