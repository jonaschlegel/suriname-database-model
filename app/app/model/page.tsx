'use client';

import { useState, useEffect, useMemo } from 'react';

/* ─── Schema definition ────────────────────────────────────────── */
interface EntityDef {
  id: string;
  type: string;
  label: string;
  crmClass: string;
  desc: string;
  color: string;
  cx: number;
  cy: number;
  dataKey: string;
  properties: { name: string; range: string }[];
}

interface RelDef {
  from: string;
  to: string;
  label: string;
  desc: string;
}

const ENTITIES: EntityDef[] = [
  {
    id: 'e24',
    type: 'E24',
    label: 'Plantation',
    crmClass: 'E24 Physical Human-Made Thing',
    desc: 'The central entity -- the physical plantation depicted by sources. Connected to locations via P53 and to operating organizations via P52.',
    color: '#3b82f6',
    cx: 400,
    cy: 260,
    dataKey: 'plantations',
    properties: [
      { name: 'P1 is identified by', range: 'E41 Appellation' },
      { name: 'skos:prefLabel', range: 'string (@nl)' },
      { name: 'P2 has type', range: 'PlantationStatus' },
      { name: 'P53 has location', range: 'E53 Place' },
      { name: 'P52 has current owner', range: 'E74 Organization' },
      { name: 'stm:depictedOnMap', range: 'MapDepiction' },
      { name: 'prov:wasDerivedFrom', range: 'ProvenanceRecord' },
    ],
  },
  {
    id: 'e74',
    type: 'E74',
    label: 'Organization',
    crmClass: 'E74 Group / sdo:Organization',
    desc: 'The legal entity that owns or operates the plantation. Identified by Wikidata Q-IDs. Annual observations from the Surinaamse Almanakken are linked to organizations.',
    color: '#8b5cf6',
    cx: 700,
    cy: 260,
    dataKey: 'organizations',
    properties: [
      { name: 'P1 is identified by', range: 'E41 Appellation' },
      { name: 'skos:prefLabel', range: 'string (@nl)' },
      { name: 'sdo:additionalType', range: 'wd:Q188913' },
      { name: 'stm:absorbedInto', range: 'E74 Organization' },
      { name: 'stm:psurId', range: 'string' },
    ],
  },
  {
    id: 'e53',
    type: 'E53',
    label: 'Place',
    crmClass: 'E53 Place',
    desc: 'Where the plantation is located. Polygons from the 1930 QGIS map, reprojected from EPSG:31170 to WGS84. Linked to E24 via P53.',
    color: '#22c55e',
    cx: 400,
    cy: 460,
    dataKey: 'places',
    properties: [
      { name: 'stm:fid', range: 'integer (QGIS feature ID)' },
      { name: 'stm:mapYear', range: 'gYear' },
      { name: 'stm:observedLabel', range: 'string' },
      { name: 'geo:hasGeometry / geo:asWKT', range: 'wktLiteral' },
    ],
  },
  {
    id: 'e41',
    type: 'E41',
    label: 'Appellation',
    crmClass: 'E41 Appellation',
    desc: 'Names as first-class entities. Each source creates its own E41 instance. Map labels identify E24; almanac names identify E74. Linked via P139 has alternative form.',
    color: '#f59e0b',
    cx: 400,
    cy: 70,
    dataKey: 'appellations-count',
    properties: [
      { name: 'P190 has symbolic content', range: 'string' },
      { name: 'P139 has alternative form', range: 'E41 Appellation' },
      { name: 'P128i is carried by', range: 'E22 Source' },
      { name: 'P72 has language', range: 'E56 Language' },
    ],
  },
  {
    id: 'e22',
    type: 'E22',
    label: 'Source',
    crmClass: 'E22 Human-Made Object',
    desc: 'Physical sources: maps, almanacs, registers. The source carries visual items (E36) and appellations (E41) that represent or identify entities.',
    color: '#6b7280',
    cx: 100,
    cy: 70,
    dataKey: 'sources',
    properties: [
      { name: 'P128 carries', range: 'E36 Visual Item / E41 Appellation' },
      { name: 'stm:mapId', range: 'string' },
      { name: 'stm:mapYear', range: 'gYear' },
      { name: 'skos:prefLabel', range: 'string' },
    ],
  },
  {
    id: 'obs',
    type: 'OBS',
    label: 'Observation',
    crmClass: 'stm:OrganizationObservation',
    desc: 'Annual snapshot from the Surinaamse Almanakken. Records the name, owner, administrator, director, enslaved count, product, and size of a plantation organization for a given year.',
    color: '#14b8a6',
    cx: 700,
    cy: 460,
    dataKey: 'observations-count',
    properties: [
      { name: 'stm:observationOf', range: 'E74 Organization' },
      { name: 'stm:observationYear', range: 'gYear' },
      { name: 'stm:observedName', range: 'E41 Appellation' },
      { name: 'stm:hasOwner', range: 'PersonObservation' },
      { name: 'stm:hasAdministrator', range: 'PersonObservation' },
      { name: 'stm:enslavedCount', range: 'integer' },
      { name: 'stm:hasProduct', range: 'string' },
      { name: 'prov:hadPrimarySource', range: 'E22 Source' },
    ],
  },
];

const RELATIONS: RelDef[] = [
  {
    from: 'e24',
    to: 'e74',
    label: 'P52 has current owner',
    desc: 'The plantation is owned by this organization',
  },
  {
    from: 'e24',
    to: 'e53',
    label: 'P53 has location',
    desc: 'The plantation is located at this place',
  },
  {
    from: 'e24',
    to: 'e41',
    label: 'P1 is identified by',
    desc: 'The plantation is identified by this name (from map)',
  },
  {
    from: 'e74',
    to: 'e41',
    label: 'P1 is identified by',
    desc: 'The organization is identified by this name (from almanac)',
  },
  {
    from: 'e22',
    to: 'e41',
    label: 'P128 carries',
    desc: 'The source carries this appellation',
  },
  {
    from: 'obs',
    to: 'e74',
    label: 'stm:observationOf',
    desc: 'This observation records data about the organization',
  },
  {
    from: 'e22',
    to: 'e24',
    label: 'P138 represents (via E36)',
    desc: 'The source depicts the plantation (through visual item)',
  },
];

/* ─── Data fetching ────────────────────────────────────────────── */
interface EntityCounts {
  plantations: number;
  organizations: number;
  places: number;
  sources: number;
  'appellations-count': number;
  'observations-count': number;
}

async function fetchCounts(): Promise<EntityCounts> {
  const DATA_BASE = '/data';

  const [
    plantations,
    organizations,
    places,
    sources,
    appellations,
    observations,
  ] = await Promise.all([
    fetch(`${DATA_BASE}/plantations.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}/organizations.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}/places.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}/sources.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}/appellations-by-entity.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}/observations-by-org.json`).then((r) => r.json()),
  ]);

  return {
    plantations: Object.keys(plantations).length,
    organizations: Object.keys(organizations).length,
    places: Object.keys(places).length,
    sources: Object.keys(sources).length,
    'appellations-count': Object.values(
      appellations as Record<string, unknown[]>,
    ).reduce((sum, arr) => sum + arr.length, 0),
    'observations-count': Object.values(
      observations as Record<string, unknown[]>,
    ).reduce((sum, arr) => sum + arr.length, 0),
  };
}

/* ─── Interactive SVG Graph ─────────────────────────────────────── */
function SchemaGraph({
  counts,
  selectedEntity,
  onSelect,
  hoveredRelation,
  onHoverRelation,
}: {
  counts: EntityCounts;
  selectedEntity: string | null;
  onSelect: (id: string) => void;
  hoveredRelation: number | null;
  onHoverRelation: (idx: number | null) => void;
}) {
  const width = 820;
  const height = 540;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-4xl mx-auto"
      role="img"
      aria-label="CIDOC-CRM entity relationship diagram showing the Suriname Time Machine data model"
    >
      {/* Background */}
      <rect
        width={width}
        height={height}
        rx="12"
        fill="#faf9f7"
        stroke="#ddd9d2"
        strokeWidth="1"
      />

      {/* Title */}
      <text
        x={width / 2}
        y="30"
        textAnchor="middle"
        className="text-sm font-bold fill-stm-warm-700"
      >
        Suriname Time Machine - CIDOC-CRM Entity Model
      </text>

      {/* Relations */}
      {RELATIONS.map((rel, i) => {
        const from = ENTITIES.find((e) => e.id === rel.from)!;
        const to = ENTITIES.find((e) => e.id === rel.to)!;
        const isHighlighted = hoveredRelation === i;
        const mx = (from.cx + to.cx) / 2;
        const my = (from.cy + to.cy) / 2;

        // Offset label slightly for readability
        const dx = to.cx - from.cx;
        const dy = to.cy - from.cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const labelOffset = 12;

        return (
          <g
            key={i}
            onMouseEnter={() => onHoverRelation(i)}
            onMouseLeave={() => onHoverRelation(null)}
            className="cursor-pointer"
          >
            <line
              x1={from.cx}
              y1={from.cy}
              x2={to.cx}
              y2={to.cy}
              stroke={isHighlighted ? '#a67830' : '#c4beb4'}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray={isHighlighted ? undefined : '6 3'}
            />
            <text
              x={mx + nx * labelOffset}
              y={my + ny * labelOffset}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-[9px] ${isHighlighted ? 'fill-stm-sepia-700 font-semibold' : 'fill-stm-warm-400'}`}
            >
              {rel.label}
            </text>
          </g>
        );
      })}

      {/* Entity nodes */}
      {ENTITIES.map((ent) => {
        const isSelected = selectedEntity === ent.id;
        const count = counts[ent.dataKey as keyof EntityCounts] ?? 0;
        return (
          <g
            key={ent.id}
            className="cursor-pointer"
            onClick={() => onSelect(ent.id)}
            role="button"
            tabIndex={0}
            aria-label={`${ent.label} (${ent.type}): ${count.toLocaleString()} entities`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(ent.id);
            }}
          >
            {/* Glow for selected */}
            {isSelected && (
              <circle
                cx={ent.cx}
                cy={ent.cy}
                r="48"
                fill={ent.color}
                fillOpacity={0.1}
              />
            )}
            {/* Node */}
            <circle
              cx={ent.cx}
              cy={ent.cy}
              r="38"
              fill="white"
              stroke={ent.color}
              strokeWidth={isSelected ? 3 : 2}
            />
            <circle
              cx={ent.cx}
              cy={ent.cy}
              r="38"
              fill={ent.color}
              fillOpacity={0.08}
            />
            {/* Type label */}
            <text
              x={ent.cx}
              y={ent.cy - 10}
              textAnchor="middle"
              className="text-[11px] font-bold"
              fill={ent.color}
            >
              {ent.type}
            </text>
            {/* Name */}
            <text
              x={ent.cx}
              y={ent.cy + 4}
              textAnchor="middle"
              className="text-[10px] fill-stm-warm-600"
            >
              {ent.label}
            </text>
            {/* Count */}
            <text
              x={ent.cx}
              y={ent.cy + 18}
              textAnchor="middle"
              className="text-[9px] fill-stm-warm-400"
            >
              {count.toLocaleString()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Entity Detail Panel ──────────────────────────────────────── */
function EntityDetail({ entity, count }: { entity: EntityDef; count: number }) {
  return (
    <div className="bg-white border border-stm-warm-200 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: entity.color }}
        >
          {entity.type}
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-stm-warm-800">
            {entity.label}
          </h3>
          <p className="text-sm text-stm-warm-400 font-mono">
            {entity.crmClass}
          </p>
        </div>
      </div>

      <p className="text-sm text-stm-warm-600 leading-relaxed mb-4">
        {entity.desc}
      </p>

      <div className="flex items-center gap-3 mb-5">
        <span className="bg-stm-warm-100 text-stm-warm-700 px-3 py-1 text-sm font-semibold">
          {count.toLocaleString()} entities
        </span>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-stm-warm-700 mb-2">
          Properties
        </h4>
        <div className="border border-stm-warm-200 overflow-hidden">
          <table className="w-full text-xs" role="table">
            <thead>
              <tr className="bg-stm-warm-50 border-b border-stm-warm-200">
                <th className="text-left px-3 py-2 text-stm-warm-500 font-medium">
                  Property
                </th>
                <th className="text-left px-3 py-2 text-stm-warm-500 font-medium">
                  Range
                </th>
              </tr>
            </thead>
            <tbody>
              {entity.properties.map((prop, i) => (
                <tr
                  key={prop.name}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-stm-warm-50/50'}
                >
                  <td className="px-3 py-1.5 font-mono text-stm-sepia-700">
                    {prop.name}
                  </td>
                  <td className="px-3 py-1.5 text-stm-warm-600">
                    {prop.range}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Relation tooltip / detail ────────────────────────────────── */
function RelationDetail({ relation }: { relation: RelDef }) {
  const from = ENTITIES.find((e) => e.id === relation.from)!;
  const to = ENTITIES.find((e) => e.id === relation.to)!;
  return (
    <div className="bg-stm-sepia-50 border border-stm-sepia-200 p-4 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-7 h-7 text-white text-[10px] font-bold flex items-center justify-center"
          style={{ backgroundColor: from.color }}
        >
          {from.type}
        </span>
        <span className="text-stm-sepia-500 font-mono text-xs">
          {relation.label}
        </span>
        <svg
          className="w-4 h-4 text-stm-sepia-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
        <span
          className="w-7 h-7 text-white text-[10px] font-bold flex items-center justify-center"
          style={{ backgroundColor: to.color }}
        >
          {to.type}
        </span>
      </div>
      <p className="text-stm-warm-600">{relation.desc}</p>
    </div>
  );
}

/* ─── Source Pattern Section ───────────────────────────────────── */
function SourcePatternSection() {
  return (
    <div className="bg-white border border-stm-warm-200 p-6">
      <h3 className="font-serif text-xl font-bold text-stm-warm-800 mb-3">
        Universal Source Pattern
      </h3>
      <p className="text-sm text-stm-warm-600 leading-relaxed mb-4">
        All information flows through sources. Maps, almanacs, and registers are
        modeled as E22 Human-Made Objects. Each source carries appellations
        (E41) that identify entities, and visual items (E36) that represent
        physical plantations (E24). The key principle:{' '}
        <strong>maps depict things; things have locations</strong>.
      </p>
      <div className="bg-stm-warm-50 p-4 font-mono text-xs text-stm-warm-600 space-y-2">
        <div>
          <span className="text-stm-warm-400">Source chain:</span>{' '}
          <span className="text-entity-e22">E22 Map</span>
          {' -> P128 carries -> '}
          <span className="text-stm-sepia-600">E36 Visual Item</span>
          {' -> P138 represents -> '}
          <span className="text-entity-e24">E24 Plantation</span>
        </div>
        <div>
          <span className="text-stm-warm-400">Name chain:</span>{' '}
          <span className="text-entity-e22">E22 Almanac</span>
          {' -> P128 carries -> '}
          <span className="text-entity-e41">E41 Name</span>
          {' -> P1i identifies -> '}
          <span className="text-entity-e74">E74 Organization</span>
        </div>
        <div>
          <span className="text-stm-warm-400">Location:</span>{' '}
          <span className="text-entity-e24">E24 Plantation</span>
          {' -> P53 has location -> '}
          <span className="text-entity-e53">E53 Place</span>
          {' (geometry)'}
        </div>
        <div>
          <span className="text-stm-warm-400">Ownership:</span>{' '}
          <span className="text-entity-e24">E24 Plantation</span>
          {' -> P52 has current owner -> '}
          <span className="text-entity-e74">E74 Organization</span>
          {' (wd:Q-ID)'}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function ModelPage() {
  const [counts, setCounts] = useState<EntityCounts | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>('e24');
  const [hoveredRelation, setHoveredRelation] = useState<number | null>(null);

  useEffect(() => {
    fetchCounts().then(setCounts);
  }, []);

  const selectedDef = useMemo(
    () => ENTITIES.find((e) => e.id === selectedEntity) || null,
    [selectedEntity],
  );

  if (!counts) {
    return (
      <div className="h-full flex items-center justify-center bg-stm-warm-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stm-sepia-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-stm-warm-500 text-sm">Loading data model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-stm-warm-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stm-warm-800 mb-3">
            Data Model
          </h1>
          <p className="text-stm-warm-500 max-w-3xl leading-relaxed">
            The Suriname Time Machine uses CIDOC-CRM to model cultural heritage
            entities. Click any node in the graph to see its properties and
            relationships. Hover over connections to highlight the CIDOC-CRM
            property linking two entities.
          </p>
        </div>

        {/* Schema Graph */}
        <div className="mb-10">
          <SchemaGraph
            counts={counts}
            selectedEntity={selectedEntity}
            onSelect={setSelectedEntity}
            hoveredRelation={hoveredRelation}
            onHoverRelation={setHoveredRelation}
          />
        </div>

        {/* Relation detail (when hovering) */}
        {hoveredRelation !== null && (
          <div className="mb-6">
            <RelationDetail relation={RELATIONS[hoveredRelation]} />
          </div>
        )}

        {/* Entity detail */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {selectedDef && (
            <EntityDetail
              entity={selectedDef}
              count={counts[selectedDef.dataKey as keyof EntityCounts] ?? 0}
            />
          )}
          <SourcePatternSection />
        </div>

        {/* All entities quick reference */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-stm-warm-800 mb-4">
            All Entity Types
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENTITIES.map((ent) => {
              const count = counts[ent.dataKey as keyof EntityCounts] ?? 0;
              return (
                <button
                  key={ent.id}
                  onClick={() => {
                    setSelectedEntity(ent.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-left bg-white border p-4 transition-all hover:shadow-md ${
                    selectedEntity === ent.id
                      ? 'border-stm-sepia-400 shadow-md ring-1 ring-stm-sepia-200'
                      : 'border-stm-warm-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-8 h-8 text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: ent.color }}
                    >
                      {ent.type}
                    </span>
                    <div>
                      <span className="font-semibold text-stm-warm-800 text-sm">
                        {ent.label}
                      </span>
                      <span className="text-stm-warm-400 text-xs ml-2">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stm-warm-500 line-clamp-2">
                    {ent.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* URI patterns */}
        <div className="bg-white border border-stm-warm-200 p-6 mb-10">
          <h3 className="font-serif text-xl font-bold text-stm-warm-800 mb-3">
            URI Patterns
          </h3>
          <div className="bg-stm-warm-50 p-4 font-mono text-xs text-stm-warm-600 space-y-1.5">
            <div>
              <span className="text-stm-warm-400 inline-block w-28">
                Plantation:
              </span>{' '}
              stm:plantation/&#123;name-slug&#125;
            </div>
            <div>
              <span className="text-stm-warm-400 inline-block w-28">
                Location:
              </span>{' '}
              stm:place/&#123;year&#125;/fid-&#123;fid&#125;
            </div>
            <div>
              <span className="text-stm-warm-400 inline-block w-28">
                Organization:
              </span>{' '}
              wd:&#123;Q-ID&#125;
            </div>
            <div>
              <span className="text-stm-warm-400 inline-block w-28">
                Appellation:
              </span>{' '}
              stm:appellation/&#123;slug&#125;
            </div>
            <div>
              <span className="text-stm-warm-400 inline-block w-28">
                Source:
              </span>{' '}
              stm:source/&#123;type&#125;-&#123;id&#125;
            </div>
            <div>
              <span className="text-stm-warm-400 inline-block w-28">
                Observation:
              </span>{' '}
              stm:obs/&#123;recordid&#125;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
