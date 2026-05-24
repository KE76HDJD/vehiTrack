'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';

const MOCK_PLATES = ['ABC-123', 'DEF-456', 'GHI-789', 'JKL-012', 'MNO-345'];

export function OCRLiveStream() {
  const [currentPlate, setCurrentPlate] = useState<string>(MOCK_PLATES[0]);
  const [confidence, setConfidence] = useState(0.92);
  const [latency, setLatency] = useState(145);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlate(MOCK_PLATES[Math.floor(Math.random() * MOCK_PLATES.length)]);
      setConfidence(0.85 + Math.random() * 0.15);
      setLatency(Math.floor(100 + Math.random() * 300));
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const confidenceStatus =
    confidence > 0.85 ? 'Excellent' : confidence > 0.7 ? 'Bon' : 'Faible';
  const confidenceColor =
    confidence > 0.85 ? '#10b981' : confidence > 0.7 ? '#f59e0b' : '#f43f5e';
  const latencyStatus = latency < 200 ? 'Optimal' : 'Normal';
  const latencyColor = latency < 200 ? '#10b981' : '#f59e0b';

  return (
    <Card className="bg-slate-50 dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-600 dark:text-[#f43f5e] animate-pulse" />
          Flux OCR Temps Réel
        </h2>
        <Badge className="bg-emerald-600 dark:bg-[#10b981] text-white dark:text-[#09090b]">EN DIRECT</Badge>
      </div>

      {/* Camera Preview Area */}
      <div className="rounded-lg p-0 mb-6 aspect-video relative overflow-hidden border-2 border-slate-200 dark:border-[#1f2937] shadow-md">
        {/* Real Camera Feed Image */}
        <img
          src="https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=675&fit=crop"
          alt="CCTV Security Camera Feed - Parking Lot Entry"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 border-l border-emerald-500 dark:border-[#10b981]"
              style={{ left: `${(i + 1) * 25}%` }}
            />
          ))}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 border-t border-emerald-500 dark:border-[#10b981]"
              style={{ top: `${(i + 1) * 25}%` }}
            />
          ))}
        </div>

        {/* Current Plate Display - Floating over image */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-white dark:text-[#9ca3af] text-sm mb-4 drop-shadow-lg">Plaque Détectée</p>
            <div className="bg-yellow-300 border-4 border-yellow-500 rounded-lg px-8 py-4 font-mono text-2xl font-bold text-gray-900 tracking-wider shadow-2xl mb-4 drop-shadow-lg">
              {currentPlate}
            </div>
            <p className="text-white dark:text-[#9ca3af] text-xs drop-shadow-lg">
              Dernière mise à jour:{' '}
              {lastUpdate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Confidence Score */}
        <div className="bg-white dark:bg-[#09090b] rounded-lg p-4 border border-slate-200 dark:border-[#1f2937]">
          <p className="text-slate-600 dark:text-[#9ca3af] text-xs font-semibold uppercase mb-3">
            Score de Confiance
          </p>
          <div className="flex items-end gap-3 mb-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {(confidence * 100).toFixed(0)}%
            </p>
            <Badge
              className={`${
                confidence > 0.85
                  ? 'bg-emerald-600 dark:bg-[#10b981] text-white dark:text-[#09090b]'
                  : confidence > 0.7
                    ? 'bg-amber-600 dark:bg-[#f59e0b] text-white dark:text-[#09090b]'
                    : 'bg-red-600 dark:bg-[#f43f5e] text-white'
              }`}
            >
              {confidenceStatus}
            </Badge>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-[#1f2937] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${confidence * 100}%`,
                backgroundColor: confidenceColor,
              }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className="bg-white dark:bg-[#09090b] rounded-lg p-4 border border-slate-200 dark:border-[#1f2937]">
          <p className="text-slate-600 dark:text-[#9ca3af] text-xs font-semibold uppercase mb-3">
            Latence Réseau
          </p>
          <div className="flex items-end gap-3 mb-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{latency}ms</p>
            <Badge
              className={
                latencyStatus === 'Optimal'
                  ? 'bg-emerald-600 dark:bg-[#10b981] text-white dark:text-[#09090b]'
                  : 'bg-amber-600 dark:bg-[#f59e0b] text-white dark:text-[#09090b]'
              }
            >
              {latencyStatus}
            </Badge>
          </div>
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: confidenceColor }}
            />
            <span className="text-slate-600 dark:text-[#9ca3af] text-xs">
              {latency < 200 ? 'Connexion stable' : 'Connexion acceptable'}
            </span>
          </div>
        </div>

        {/* Processing Status */}
        <div className="bg-white dark:bg-[#09090b] rounded-lg p-4 border border-slate-200 dark:border-[#1f2937]">
          <p className="text-slate-600 dark:text-[#9ca3af] text-xs font-semibold uppercase mb-3">
            État du Service
          </p>
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-emerald-600 dark:bg-[#10b981] animate-pulse flex-shrink-0 mt-1"></div>
            <div>
              <p className="text-slate-900 dark:text-white font-semibold text-sm">Opérationnel</p>
              <p className="text-slate-600 dark:text-[#9ca3af] text-xs">Traitement actif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {confidence < 0.7 && (
        <div className="mt-4 bg-red-50 dark:bg-[#f43f5e]/10 border border-red-200 dark:border-[#f43f5e]/30 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-[#f43f5e] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 dark:text-white font-semibold text-sm">Alerte Qualité</p>
            <p className="text-red-700 dark:text-[#9ca3af] text-xs mt-1">
              La confiance de reconnaissance est inférieure à 70%. Considérez une intervention manuelle.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
