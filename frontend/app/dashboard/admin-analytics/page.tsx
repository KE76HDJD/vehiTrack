'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Area, AreaChart, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, AlertTriangle, Download } from 'lucide-react';

const OCCUPANCY_DATA = [
  { time: '6:00', occupancy: 15, capacity: 120 },
  { time: '9:00', occupancy: 85, capacity: 120 },
  { time: '12:00', occupancy: 110, capacity: 120 },
  { time: '15:00', occupancy: 95, capacity: 120 },
  { time: '18:00', occupancy: 70, capacity: 120 },
  { time: '21:00', occupancy: 35, capacity: 120 },
  { time: '00:00', occupancy: 10, capacity: 120 },
];

const REVENUE_DATA = [
  { month: 'Jan', revenue: 4200, reservations: 320 },
  { month: 'Feb', revenue: 5800, reservations: 420 },
  { month: 'Mar', revenue: 6200, reservations: 480 },
  { month: 'Apr', revenue: 7100, reservations: 560 },
  { month: 'May', revenue: 8400, reservations: 650 },
];

const ZONE_DISTRIBUTION = [
  { name: 'Zone A', value: 35, color: '#059669' },
  { name: 'Zone B', value: 28, color: '#0891b2' },
  { name: 'Zone C', value: 25, color: '#d97706' },
  { name: 'Zone VIP', value: 12, color: '#8b5cf6' },
];

const USER_STATS = [
  { role: 'Gardiens', count: 5, status: 'active' },
  { role: 'Managers', count: 3, status: 'active' },
  { role: 'Employés', count: 150, status: 'active' },
  { role: 'Administrateurs', count: 2, status: 'active' },
];

export default function AdminAnalyticsPage() {
  const totalRevenue = REVENUE_DATA.reduce((sum, item) => sum + item.revenue, 0);
  const totalReservations = REVENUE_DATA.reduce((sum, item) => sum + item.reservations, 0);
  const avgOccupancy = Math.round(OCCUPANCY_DATA.reduce((sum, item) => sum + (item.occupancy / item.capacity) * 100, 0) / OCCUPANCY_DATA.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Analytics Avancées
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Tableaux de bord et métriques système complets
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
          <Download className="w-4 h-4" />
          Exporter Rapport
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Revenu Total</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{(totalRevenue / 1000).toFixed(1)}K€</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">+12% vs mois précédent</p>
            </div>
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Réservations</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalReservations}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">+8% vs mois précédent</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Taux Occupation</p>
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{avgOccupancy}%</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Moyenne horaire</p>
            </div>
            <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Utilisateurs</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">160</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Actifs ce mois</p>
            </div>
            <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Occupancy Chart */}
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Occupation Horaire</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={OCCUPANCY_DATA}>
              <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
              <Area type="monotone" dataKey="occupancy" stroke="#059669" fillOpacity={1} fill="url(#colorOccupancy)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Revenu Mensuel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#059669" name="Revenu (€)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Zone Distribution and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Zone Distribution */}
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Répartition par Zone</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ZONE_DISTRIBUTION}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ZONE_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* User Statistics */}
        <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Utilisateurs par Rôle</h2>
          <div className="space-y-4">
            {USER_STATS.map((stat, index) => {
              const maxCount = Math.max(...USER_STATS.map(s => s.count));
              const percentage = (stat.count / maxCount) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{stat.role}</span>
                    <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {stat.count}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#2a2a2f] rounded-full h-2">
                    <div
                      className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">État du Système</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Serveur API</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Opérationnel</p>
              </div>
              <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Temps Réel</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Synchronisé</p>
              </div>
              <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Base de Données</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Charge moyenne</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

