'use client';

import type { AllData } from '@/lib/data';
import { entityTypeColor, uriLabel } from '@/lib/data';
import type {
  E22Source,
  E24Plantation,
  E41Appellation,
  E53Place,
  E74Organization,
  GeoJSONFeature,
  OrganizationObservation,
  ProvenanceRecord,
} from '@/lib/types';
import { useRef, useState } from 'react';
import EntityGraph from './EntityGraph';
import ProvenanceChain from './ProvenanceChain';

interface PlantationPanelProps {
  feature: GeoJSONFeature | null;
  data: AllData | null;
  onClose: () => void;
}

function Badge({ type }: { type: string }) {
  return (
    <span
      className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-white mr-1.5 uppercase tracking-wide"
      style={{ backgroundColor: entityTypeColor(type) }}
    >
      {type}
    </span>
  );
}

function SectionHeader({
  id,
  title,
  badge,
  open,
  onToggle,
  refs,
  count,
}: {
  id: string;
  title: string;
  badge: string;
  open: boolean;
  onToggle: () => void;
  refs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  count?: number;
}) {
  return (
    <div
      ref={(el) => {
        refs.current[id] = el;
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-3 text-left hover:bg-stm-warm-50/50 transition-colors"
        aria-expanded={open}
        aria-controls={`section-${id}`}
      >
        <span className="text-xs font-semibold text-stm-warm-700 flex items-center">
          <Badge type={badge} />
          {title}
          {count != null && (
            <span className="ml-1.5 text-stm-warm-400 font-normal">
              ({count})
            </span>
          )}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-stm-warm-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | number | boolean | null;
  mono?: boolean;
}) {
  if (value == null || value === '') return null;
  return (
    <div className="flex gap-2 text-xs leading-relaxed">
      <span className="text-stm-warm-400 min-w-18 shrink-0">{label}</span>
      <span
        className={`text-stm-warm-700 ${mono ? 'font-mono text-[11px]' : ''}`}
      >
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
      </span>
    </div>
  );
}

function WikidataLink({ qid }: { qid: string }) {
  const id = qid.includes('/') ? qid.split('/').pop()! : qid;
  return (
    <a
      href={`https://www.wikidata.org/wiki/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-stm-teal-600 hover:underline font-mono"
    >
      {id}
    </a>
  );
}

/** Determine a human source type label from P2_has_type URI */
function sourceTypeLabel(src: E22Source): string {
  const t = src.P2_has_type || '';
  if (t.includes('almanac')) return 'Almanac';
  if (t.includes('map')) return 'Map';
  if (t.includes('register') || t.includes('registry')) return 'Register';
  return 'Source';
}

/** Group observations by their hadPrimarySource */
function groupBySource(
  observations: OrganizationObservation[],
  sources: E22Source[],
  allData: AllData,
) {
  const sourceMap = new Map<string, E22Source>();
  for (const s of sources) sourceMap.set(s['@id'], s);

  const groups = new Map<
    string,
    { source: E22Source | null; observations: OrganizationObservation[] }
  >();

  for (const obs of observations) {
    const key = obs.hadPrimarySource || '__unknown__';
    if (!groups.has(key)) {
      const src = obs.hadPrimarySource
        ? sourceMap.get(obs.hadPrimarySource) ||
          (allData.sources[obs.hadPrimarySource] as E22Source | undefined) ||
          null
        : null;
      groups.set(key, { source: src, observations: [] });
    }
    groups.get(key)!.observations.push(obs);
  }

  // Sources that have no observations (e.g. maps, location docs)
  for (const src of sources) {
    if (!groups.has(src['@id'])) {
      groups.set(src['@id'], { source: src, observations: [] });
    }
  }

  // Sort groups: sources with year ascending, unknown last
  return Array.from(groups.entries()).sort(([aKey, a], [bKey, b]) => {
    if (aKey === '__unknown__') return 1;
    if (bKey === '__unknown__') return -1;
    const aYear = a.source?.mapYear || '';
    const bYear = b.source?.mapYear || '';
    return aYear.localeCompare(bYear);
  });
}

function ObservationCard({ obs }: { obs: OrganizationObservation }) {
  return (
    <div className="border-l-2 border-stm-warm-200 pl-3 py-1.5 text-xs hover:border-stm-teal-400 transition-colors">
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-semibold text-stm-teal-700">
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
            <span className="text-stm-warm-400">Name</span>
            <span className="font-medium">{obs.observedName}</span>
          </>
        )}
        {obs.hasOwner && (
          <>
            <span className="text-stm-warm-400">Owner</span>
            <span>{obs.hasOwner}</span>
          </>
        )}
        {obs.hasAdministrator && (
          <>
            <span className="text-stm-warm-400">Admin</span>
            <span>{obs.hasAdministrator}</span>
          </>
        )}
        {obs.hasDirector && (
          <>
            <span className="text-stm-warm-400">Director</span>
            <span>{obs.hasDirector}</span>
          </>
        )}
        {obs.enslavedCount != null && (
          <>
            <span className="text-stm-warm-400">Enslaved</span>
            <span className="font-medium">{obs.enslavedCount}</span>
          </>
        )}
        {obs.sizeAkkers != null && (
          <>
            <span className="text-stm-warm-400">Size</span>
            <span>{obs.sizeAkkers} akkers</span>
          </>
        )}
      </div>
    </div>
  );
}

function SourceGroup({
  source,
  observations,
  appellations,
}: {
  source: E22Source | null;
  observations: OrganizationObservation[];
  appellations: E41Appellation[];
}) {
  const [expanded, setExpanded] = useState(observations.length <= 5);
  const sorted = [...observations].sort(
    (a, b) => parseInt(a.observationYear) - parseInt(b.observationYear),
  );
  const typeLabel = source ? sourceTypeLabel(source) : 'Unknown';

  // Names from this source
  const sourceApps = source
    ? appellations.filter((a) => a.P128i_is_carried_by === source['@id'])
    : [];

  return (
    <div className="border border-stm-warm-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-stm-warm-50/50 transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stm-warm-400">
              {typeLabel}
            </span>
            {source?.mapYear && (
              <span className="text-[10px] text-stm-warm-400">
                {source.mapYear}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-stm-warm-800 truncate">
            {source?.prefLabel || 'Unknown source'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {observations.length > 0 && (
            <span className="text-[10px] text-stm-warm-400">
              {observations.length} obs
            </span>
          )}
          <svg
            className={`w-3.5 h-3.5 text-stm-warm-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-2 space-y-1.5">
          {/* Names found in this source */}
          {sourceApps.length > 0 && (
            <div className="text-xs text-stm-warm-500 border-b border-stm-warm-100 pb-1.5 mb-1">
              {sourceApps.map((app, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  <span className="text-stm-sepia-700 font-medium">
                    &ldquo;{app.P190_has_symbolic_content}&rdquo;
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Observations */}
          {sorted.length > 0 ? (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {sorted.map((obs) => (
                <ObservationCard key={obs['@id']} obs={obs} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-stm-warm-400 italic py-1">
              No observations from this source
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlantationPanel({
  feature,
  data,
  onClose,
}: PlantationPanelProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    plantation: true,
    organization: true,
    place: true,
    sources: true,
    provenance: false,
  });

  if (!feature || !data) return null;

  const toggle = (id: string) =>
    setOpenSections((s) => ({ ...s, [id]: !s[id] }));

  const props = feature.properties;
  const plantation = data.plantations[props.plantationUri] as
    | E24Plantation
    | undefined;
  const orgUri = props.organizationQid
    ? `http://www.wikidata.org/entity/${props.organizationQid}`
    : plantation?.P52_has_current_owner;
  const organization = orgUri
    ? (data.organizations[orgUri] as E74Organization | undefined)
    : undefined;
  const place = props.placeUri
    ? (data.places[props.placeUri] as E53Place | undefined)
    : undefined;

  // Appellations for both E24 and E74
  const plantationApps = (data.appellations[props.plantationUri] ||
    []) as E41Appellation[];
  const orgApps = orgUri
    ? ((data.appellations[orgUri] || []) as E41Appellation[])
    : [];
  const allApps = [...plantationApps, ...orgApps];

  // Observations
  const observations = orgUri
    ? ((data.observations[orgUri] || []) as OrganizationObservation[])
    : [];

  // Sources used
  const sourceUris = new Set<string>();
  for (const app of allApps) {
    if (app.P128i_is_carried_by) sourceUris.add(app.P128i_is_carried_by);
  }
  for (const obs of observations) {
    if (obs.hadPrimarySource) sourceUris.add(obs.hadPrimarySource);
  }
  if (place?.P70i_is_documented_in) sourceUris.add(place.P70i_is_documented_in);
  const sources = Array.from(sourceUris)
    .map((uri) => data.sources[uri] as E22Source | undefined)
    .filter(Boolean) as E22Source[];

  // Group observations under their source
  const sourceGroups = groupBySource(observations, sources, data);

  // Provenance records
  const provRecords: { label: string; record: ProvenanceRecord }[] = [];
  if (plantation?.wasDerivedFrom) {
    const p = data.provenance[plantation.wasDerivedFrom] as
      | ProvenanceRecord
      | undefined;
    if (p) provRecords.push({ label: 'Plantation (E24)', record: p });
  }
  if (organization?.wasDerivedFrom) {
    const p = data.provenance[organization.wasDerivedFrom] as
      | ProvenanceRecord
      | undefined;
    if (p) provRecords.push({ label: 'Organization (E74)', record: p });
  }
  if (place?.wasDerivedFrom) {
    const p = data.provenance[place.wasDerivedFrom] as
      | ProvenanceRecord
      | undefined;
    if (p) provRecords.push({ label: 'Location (E53)', record: p });
  }

  function scrollToSection(section: string) {
    const el = sectionRefs.current[section];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="absolute top-0 right-0 w-105 h-full bg-stm-warm-50 shadow-xl z-1001 flex flex-col border-l border-stm-warm-300">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stm-warm-300 bg-white">
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-2">
            <h2 className="text-base font-bold text-stm-warm-900 font-serif leading-tight">
              {props.name || 'Unknown'}
            </h2>
            <p className="text-[11px] text-stm-warm-400 font-mono mt-0.5">
              {uriLabel(props.plantationUri)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-stm-warm-100 text-stm-warm-400 hover:text-stm-warm-600 transition-colors shrink-0"
            aria-label="Close detail panel"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Entity Graph */}
        <div className="px-4 py-3 bg-white border-b border-stm-warm-200">
          <p className="text-[10px] font-semibold text-stm-warm-400 uppercase tracking-wider mb-1.5">
            Entity Connections
          </p>
          <EntityGraph
            plantation={plantation || null}
            organization={organization || null}
            place={place || null}
            appellations={allApps}
            sources={sources}
            observationCount={observations.length}
            onNodeClick={scrollToSection}
          />
        </div>

        <div className="divide-y divide-stm-warm-200">
          {/* Plantation (E24) */}
          <div>
            <SectionHeader
              id="plantation"
              title="Plantation"
              badge="E24"
              open={openSections.plantation}
              onToggle={() => toggle('plantation')}
              refs={sectionRefs}
            />
            {openSections.plantation && (
              <div className="px-4 pb-3 space-y-0.5">
                <Field label="Name" value={plantation?.prefLabel} />
                <Field label="Status" value={plantation?.status} />
                {plantation?.['stm:depictedOnMap'] && (
                  <div className="mt-1.5">
                    <span className="text-[10px] text-stm-warm-400 uppercase tracking-wider">
                      Depicted on maps
                    </span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {plantation['stm:depictedOnMap'].map((m, i) => (
                        <span
                          key={i}
                          className="bg-white text-stm-sepia-700 border border-stm-sepia-200 px-1.5 py-0.5 text-[10px]"
                        >
                          {m.mapId} &mdash; &ldquo;{m.labelOnMap}&rdquo;
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Organization (E74) */}
          {organization && (
            <div>
              <SectionHeader
                id="organization"
                title="Organization"
                badge="E74"
                open={openSections.organization}
                onToggle={() => toggle('organization')}
                refs={sectionRefs}
              />
              {openSections.organization && (
                <div className="px-4 pb-3 space-y-0.5">
                  <Field label="Name" value={organization.prefLabel} />
                  <div className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-stm-warm-400 min-w-18">Wikidata</span>
                    <WikidataLink qid={organization['@id']} />
                  </div>
                  <Field label="PSUR ID" value={organization.psurId} mono />
                  <Field
                    label="Absorbed"
                    value={
                      organization.absorbedInto
                        ? uriLabel(organization.absorbedInto)
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Location (E53) */}
          {place && (
            <div>
              <SectionHeader
                id="place"
                title="Location"
                badge="E53"
                open={openSections.place}
                onToggle={() => toggle('place')}
                refs={sectionRefs}
              />
              {openSections.place && (
                <div className="px-4 pb-3 space-y-0.5">
                  <Field label="Feature" value={place.fid} mono />
                  <Field label="Map Year" value={place.mapYear} />
                  <Field label="Label" value={place.observedLabel} />
                  <Field
                    label="Source"
                    value={
                      place.P70i_is_documented_in
                        ? uriLabel(place.P70i_is_documented_in)
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Sources & Evidence — observations grouped under their source */}
          <div>
            <SectionHeader
              id="sources"
              title="Sources & Evidence"
              badge="E22"
              open={openSections.sources}
              onToggle={() => toggle('sources')}
              refs={sectionRefs}
              count={sources.length}
            />
            {openSections.sources && (
              <div className="px-3 pb-3 space-y-1.5">
                {sourceGroups.length > 0 ? (
                  sourceGroups.map(([key, group]) => (
                    <SourceGroup
                      key={key}
                      source={group.source}
                      observations={group.observations}
                      appellations={allApps}
                    />
                  ))
                ) : (
                  <p className="text-xs text-stm-warm-400 italic px-1 py-2">
                    No sources linked to this plantation
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Provenance */}
          {provRecords.length > 0 && (
            <div>
              <SectionHeader
                id="provenance"
                title="Provenance"
                badge="PROV"
                open={openSections.provenance ?? false}
                onToggle={() => toggle('provenance')}
                refs={sectionRefs}
              />
              {openSections.provenance && (
                <div className="px-4 pb-3">
                  {provRecords.map(({ label, record }) => (
                    <div key={record['@id']} className="mb-2">
                      <p className="text-xs text-stm-warm-500 font-medium mb-0.5">
                        {label}
                      </p>
                      <ProvenanceChain record={record} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
