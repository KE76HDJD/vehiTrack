'use client';

import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface ParkingZone {
  id: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  pricePerHour: number;
}

interface ReservationForm {
  date: string;
  startTime: string;
  duration: number;
  zone: string;
}

const PARKING_ZONES: ParkingZone[] = [
  { id: 'zone-a', name: 'Zone A - Entrée Principale', totalSpaces: 50, availableSpaces: 12, pricePerHour: 2.5 },
  { id: 'zone-b', name: 'Zone B - Sous-sol Niveau 1', totalSpaces: 75, availableSpaces: 8, pricePerHour: 2.0 },
  { id: 'zone-c', name: 'Zone C - Sous-sol Niveau 2', totalSpaces: 60, availableSpaces: 35, pricePerHour: 1.5 },
  { id: 'zone-vip', name: 'Zone VIP - Réservée', totalSpaces: 20, availableSpaces: 3, pricePerHour: 5.0 },
];

export default function ReservationParkingPage() {
  const { currentUser } = useRole();
  const [form, setForm] = useState<ReservationForm>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 2,
    zone: 'zone-a',
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedZone = PARKING_ZONES.find(z => z.id === form.zone);
  const estimatedCost = selectedZone ? selectedZone.pricePerHour * form.duration : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Nouvelle Réservation
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Réservez une place de parking pour votre véhicule
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reservation Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <Calendar className="w-4 h-4" />
                  Date de Réservation
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1a1a1f] border border-slate-200 dark:border-[#2a2a2f] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <Clock className="w-4 h-4" />
                  Heure de Début
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1a1a1f] border border-slate-200 dark:border-[#2a2a2f] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <Clock className="w-4 h-4" />
                  Durée (heures)
                </label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1a1a1f] border border-slate-200 dark:border-[#2a2a2f] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {[1, 2, 3, 4, 6, 8, 12, 24].map(h => (
                    <option key={h} value={h}>{h}h</option>
                  ))}
                </select>
              </div>

              {/* Zone Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <MapPin className="w-4 h-4" />
                  Zone de Parking
                </label>
                <select
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1a1a1f] border border-slate-200 dark:border-[#2a2a2f] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PARKING_ZONES.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} - {zone.availableSpaces} places disponibles
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Confirmer la Réservation
              </Button>

              {submitted && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">Réservation confirmée</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Un email de confirmation sera envoyé</p>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Reservation Summary */}
          <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Résumé</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Date</span>
                <span className="font-medium text-slate-900 dark:text-white">{form.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Heure</span>
                <span className="font-medium text-slate-900 dark:text-white">{form.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Durée</span>
                <span className="font-medium text-slate-900 dark:text-white">{form.duration}h</span>
              </div>
              <div className="border-t border-slate-200 dark:border-[#2a2a2f] pt-3 mt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Tarif horaire</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedZone?.pricePerHour}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">Total estimé</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{estimatedCost.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Zone Info */}
          {selectedZone && (
            <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Zone Sélectionnée</h3>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedZone.name}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  {selectedZone.availableSpaces} / {selectedZone.totalSpaces} places disponibles
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#2a2a2f] rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(selectedZone.availableSpaces / selectedZone.totalSpaces) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Availability Notice */}
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-400">Tarifs variables</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Les prix varient selon la zone et l'heure</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
