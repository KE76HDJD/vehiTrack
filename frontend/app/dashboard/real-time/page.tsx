'use client';

import { useRole } from '@/contexts/RoleContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OCRLiveStream } from '@/components/security/OCRLiveStream';
import { Eye, AlertTriangle, Clock, Zap, RotateCcw } from 'lucide-react';

export default function RealTimePage() {
  const { currentUser } = useRole();
  const { events, isConnected, clearEvents } = useWebSocket();

  // Check if user has access to this page
  if (!['gardien', 'administrateur'].includes(currentUser.role)) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-[#f43f5e] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Accès Refusé</h2>
        <p className="text-[#9ca3af]">Vous n&apos;avez pas accès à ce module.</p>
      </div>
    );
  }

  const criticalEvents = events.filter((e) => e.severity === 'critical');
  const warningEvents = events.filter((e) => e.severity === 'warning');
  const infoEvents = events.filter((e) => e.severity === 'info');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Surveillance Temps Réel</h1>
        <p className="text-[#9ca3af]">Monitoring en direct du flux de véhicules et des alertes de sécurité</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#111114] border-[#1f2937] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#9ca3af] text-sm mb-2">Statut WebSocket</p>
              <p className="text-xl font-bold text-[#10b981]">
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isConnected ? 'bg-[#10b981]/20' : 'bg-[#f43f5e]/20'
              }`}
            >
              <Zap
                className={`w-6 h-6 ${
                  isConnected ? 'text-[#10b981]' : 'text-[#f43f5e]'
                }`}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-[#111114] border-[#1f2937] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#9ca3af] text-sm mb-2">Total d&apos;Événements</p>
              <p className="text-xl font-bold text-[#06b6d4]">{events.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#06b6d4]/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#06b6d4]" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#111114] border-[#1f2937] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#9ca3af] text-sm mb-2">Alertes Critiques</p>
              <p className="text-xl font-bold text-[#f43f5e]">{criticalEvents.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f43f5e]/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#f43f5e]" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#111114] border-[#1f2937] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#9ca3af] text-sm mb-2">Avertissements</p>
              <p className="text-xl font-bold text-[#f59e0b]">{warningEvents.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
            </div>
          </div>
        </Card>
      </div>

      {/* OCR Live Stream */}
      <OCRLiveStream />

      {/* Real-time Event Feed */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Flux d&apos;Événements en Direct</h2>
          <Button
            onClick={clearEvents}
            variant="outline"
            size="sm"
            className="border-[#1f2937] text-[#9ca3af] hover:bg-[#1f2937]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Effacer
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-[#9ca3af] text-center py-8">
              En attente d&apos;événements...
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border flex items-start justify-between ${
                  event.severity === 'critical'
                    ? 'bg-[#f43f5e]/10 border-[#f43f5e]/30'
                    : event.severity === 'warning'
                      ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30'
                      : 'bg-[#10b981]/10 border-[#10b981]/30'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={`text-xs ${
                        event.type === 'entry'
                          ? 'bg-[#10b981] text-[#09090b]'
                          : event.type === 'exit'
                            ? 'bg-[#06b6d4] text-[#09090b]'
                            : 'bg-[#f43f5e] text-white'
                      }`}
                    >
                      {event.type.toUpperCase()}
                    </Badge>
                    <span className="text-[#9ca3af] text-xs">
                      {event.vehicle_plate}
                    </span>
                    {event.severity && (
                      <Badge
                        className={`text-xs ${
                          event.severity === 'critical'
                            ? 'bg-[#f43f5e] text-white'
                            : 'bg-[#f59e0b] text-[#09090b]'
                        }`}
                      >
                        {event.severity.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {event.zone && (
                      <span className="text-[#9ca3af]">{event.zone}</span>
                    )}
                    <span className="text-[#9ca3af]">
                      Confiance: {(event.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                  <Clock className="w-4 h-4" />
                  {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Action Center */}
      <Card className="bg-[#111114] border-[#1f2937] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Centre d&apos;Action</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button className="bg-[#10b981] text-[#09090b] hover:bg-[#059669] py-6 text-base font-semibold">
            Forcer l&apos;Ouverture
          </Button>
          <Button className="bg-[#06b6d4] text-[#09090b] hover:bg-[#0891b2] py-6 text-base font-semibold">
            Saisie Manuelle
          </Button>
        </div>
      </Card>
    </div>
  );
}
