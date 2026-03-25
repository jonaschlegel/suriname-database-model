'use client';

import type { OrganizationObservation } from '@/lib/types';

interface ObservationTimelineProps {
  observations: OrganizationObservation[];
}

export default function ObservationTimeline({
  observations,
}: ObservationTimelineProps) {
  if (!observations.length) {
    return (
      <p className="text-sm text-stm-warm-400 italic">
        No almanac observations found
      </p>
    );
  }

  const sorted = [...observations].sort(
    (a, b) => parseInt(a.observationYear) - parseInt(b.observationYear),
  );

  return (
    <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
      {sorted.map((obs) => (
        <div
          key={obs['@id']}
          className="border border-stm-warm-200 p-2.5 text-xs hover:bg-stm-warm-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-stm-teal-700 text-sm">
              {obs.observationYear}
            </span>
            <div className="flex gap-1">
              {obs.product && (
                <span className="bg-stm-teal-50 text-stm-teal-700 px-1.5 py-0.5 text-[10px]">
                  {obs.product}
                </span>
              )}
              {obs.deserted && (
                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 text-[10px]">
                  verlaten
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-stm-warm-600">
            {obs.observedName && (
              <>
                <span className="text-stm-warm-400">Name:</span>
                <span className="font-medium">{obs.observedName}</span>
              </>
            )}
            {obs.hasOwner && (
              <>
                <span className="text-stm-warm-400">Owner:</span>
                <span>{obs.hasOwner}</span>
              </>
            )}
            {obs.hasAdministrator && (
              <>
                <span className="text-stm-warm-400">Admin:</span>
                <span>{obs.hasAdministrator}</span>
              </>
            )}
            {obs.hasDirector && (
              <>
                <span className="text-stm-warm-400">Director:</span>
                <span>{obs.hasDirector}</span>
              </>
            )}
            {obs.enslavedCount != null && (
              <>
                <span className="text-stm-warm-400">Enslaved:</span>
                <span className="font-medium">{obs.enslavedCount}</span>
              </>
            )}
            {obs.sizeAkkers != null && (
              <>
                <span className="text-stm-warm-400">Size:</span>
                <span>{obs.sizeAkkers} akkers</span>
              </>
            )}
            {obs.locationStd && (
              <>
                <span className="text-stm-warm-400">Location:</span>
                <span>{obs.locationStd}</span>
              </>
            )}
            {obs.pageReference && (
              <>
                <span className="text-stm-warm-400">Page:</span>
                <span>{obs.pageReference}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
