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
import { useRef } from 'react';
import EntityGraph from './EntityGraph';
import ObservationTimeline from './ObservationTimeline';
import ProvenanceChain from './ProvenanceChain';

interface PlantationPanelProps {
  feature: GeoJSONFeature | null;
  data: AllData | null;
  onClose: () => void;
}

function Badge({ type }: { type: string }) {
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mr-1.5"
      style={{ backgroundColor: entityTypeColor(type) }}
    >
      {type}
    </span>
  );
}

function Section({
  id,
  title,
  badge,
  children,
  refs,
}: {
  id: string;
  title: string;
  badge: string;
  children: React.ReactNode;
  refs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  return (
    <div
      ref={(el) => {
        refs.current[id] = el;
      }}
      className="border-b border-gray-100 pb-3 mb-3 last:border-0"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
        <Badge type={badge} />
        {title}
      </h3>
      {children}
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
    <div className="flex gap-2 text-xs">
      <span className="text-gray-400 min-w-20">{label}:</span>
      <span className={`text-gray-700 ${mono ? 'font-mono text-[11px]' : ''}`}>
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
      className="text-xs text-blue-600 hover:underline font-mono"
    >
      {id}
    </a>
  );
}

export default function PlantationPanel({
  feature,
  data,
  onClose,
}: PlantationPanelProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  if (!feature || !data) return null;

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
    <div className="absolute top-0 right-0 w-105 h-full bg-white shadow-xl z-1001 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {props.name || 'Unknown'}
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            {uriLabel(props.plantationUri)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 text-lg"
        >
          &#10005;
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {/* Entity Graph */}
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
            Entity Connections
          </h3>
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

        {/* Plantation (E24) */}
        <Section
          id="plantation"
          title="Plantation"
          badge="E24"
          refs={sectionRefs}
        >
          <Field label="Name" value={plantation?.prefLabel} />
          <Field label="Status" value={plantation?.status} />
          {plantation?.['stm:depictedOnMap'] && (
            <div className="mt-1">
              <span className="text-xs text-gray-400">Depicted on maps:</span>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {plantation['stm:depictedOnMap'].map((m, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]"
                  >
                    {m.mapId} &mdash; &ldquo;{m.labelOnMap}&rdquo;
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Organization (E74) */}
        {organization && (
          <Section
            id="organization"
            title="Organization"
            badge="E74"
            refs={sectionRefs}
          >
            <Field label="Name" value={organization.prefLabel} />
            <div className="flex gap-2 text-xs">
              <span className="text-gray-400 min-w-20">Wikidata:</span>
              <WikidataLink qid={organization['@id']} />
            </div>
            <Field label="PSUR ID" value={organization.psurId} mono />
            <Field
              label="Absorbed Into"
              value={
                organization.absorbedInto
                  ? uriLabel(organization.absorbedInto)
                  : undefined
              }
            />
          </Section>
        )}

        {/* Location (E53) */}
        {place && (
          <Section id="place" title="Location" badge="E53" refs={sectionRefs}>
            <Field label="Feature ID" value={place.fid} mono />
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
          </Section>
        )}

        {/* Appellations (E41) */}
        {allApps.length > 0 && (
          <Section
            id="appellations"
            title={`Names (${allApps.length})`}
            badge="E41"
            refs={sectionRefs}
          >
            <div className="space-y-1">
              {allApps.map((app) => (
                <div
                  key={app['@id']}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="font-medium text-amber-700">
                    &ldquo;{app.P190_has_symbolic_content}&rdquo;
                  </span>
                  {app.P128i_is_carried_by && (
                    <span className="text-gray-400">
                      from {uriLabel(app.P128i_is_carried_by)}
                    </span>
                  )}
                  {app.P139_has_alternative_form && (
                    <span
                      className="text-amber-400"
                      title={`Alternative form of: ${uriLabel(app.P139_has_alternative_form)}`}
                    >
                      &#8596;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Sources (E22) */}
        {sources.length > 0 && (
          <Section
            id="sources"
            title={`Sources (${sources.length})`}
            badge="E22"
            refs={sectionRefs}
          >
            <div className="space-y-1">
              {sources.map((src) => (
                <div key={src['@id']} className="text-xs">
                  <span className="font-medium text-gray-700">
                    {src.prefLabel}
                  </span>
                  {src.mapYear && (
                    <span className="text-gray-400 ml-1">({src.mapYear})</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Observations */}
        <Section
          id="observations"
          title={`Observations (${observations.length})`}
          badge="OBS"
          refs={sectionRefs}
        >
          <ObservationTimeline observations={observations} />
        </Section>

        {/* Provenance */}
        {provRecords.length > 0 && (
          <Section
            id="provenance"
            title="Provenance Chains"
            badge="PROV"
            refs={sectionRefs}
          >
            {provRecords.map(({ label, record }) => (
              <div key={record['@id']} className="mb-2">
                <p className="text-xs text-gray-500 font-medium mb-0.5">
                  {label}
                </p>
                <ProvenanceChain record={record} />
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
