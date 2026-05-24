'use client';

import { useMockData } from '@/hooks/useMockData';
import { Card } from '@/components/ui/card';
import { DAYS_OF_WEEK } from '@/lib/constants';

export function HeatmapMatrix() {
  const { heatmapData } = useMockData();

  // Find min and max for color scaling
  const counts = heatmapData.map((d) => d.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  const getColor = (count: number) => {
    const normalized = (count - minCount) / (maxCount - minCount);
    if (normalized < 0.25) return { bg: 'bg-[#10b981]/20', border: 'border-[#10b981]' };
    if (normalized < 0.5) return { bg: 'bg-[#f59e0b]/20', border: 'border-[#f59e0b]' };
    if (normalized < 0.75) return { bg: 'bg-[#f43f5e]/30', border: 'border-[#f43f5e]' };
    return { bg: 'bg-[#f43f5e]/50', border: 'border-[#f43f5e]' };
  };

  return (
    <Card className="bg-[#111114] border-[#1f2937] p-6">
      <h2 className="text-xl font-bold text-white mb-4">Distribution Horaire (7 jours x 24h)</h2>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hours Header */}
          <div className="flex gap-1 mb-2">
            <div className="w-12"></div>
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={hour}
                className="w-8 text-center text-xs text-[#9ca3af] font-medium"
              >
                {hour}h
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <div key={day} className="flex gap-1 mb-1 items-center">
              <div className="w-12 text-xs font-medium text-[#9ca3af]">
                {day.substring(0, 3)}
              </div>
              {Array.from({ length: 24 }).map((_, hour) => {
                const data = heatmapData.find(
                  (d) => d.day === dayIndex && d.hour === hour
                );
                const count = data?.count || 0;
                const colors = getColor(count);

                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={`w-8 h-8 rounded border ${colors.bg} ${colors.border} flex items-center justify-center text-xs text-[#9ca3af] hover:shadow-lg hover:shadow-[#10b981]/30 cursor-pointer transition-all group relative`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-white font-semibold">
                      {Math.floor(count / 10)}
                    </span>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#09090b] border border-[#1f2937] rounded px-2 py-1 text-xs text-[#fafafa] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      {count} véhicules
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#10b981]/20 border border-[#10b981]"></div>
          <span className="text-xs text-[#9ca3af]">Bas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#f59e0b]/20 border border-[#f59e0b]"></div>
          <span className="text-xs text-[#9ca3af]">Moyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#f43f5e]/30 border border-[#f43f5e]"></div>
          <span className="text-xs text-[#9ca3af]">Haut</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#f43f5e]/50 border border-[#f43f5e]"></div>
          <span className="text-xs text-[#9ca3af]">Très Haut</span>
        </div>
      </div>
    </Card>
  );
}
