import type {
  E24Plantation,
  E74Organization,
  E53Place,
  E41Appellation,
  E22Source,
  OrganizationObservation,
  ProvenanceRecord,
  GeoJSONCollection,
} from './types';

const DATA_BASE = '/data';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}/${path}`);
  return res.json();
}

let _plantations: Record<string, E24Plantation> | null = null;
let _organizations: Record<string, E74Organization> | null = null;
let _places: Record<string, E53Place> | null = null;
let _sources: Record<string, E22Source> | null = null;
let _appellationsByEntity: Record<string, E41Appellation[]> | null = null;
let _observationsByOrg: Record<string, OrganizationObservation[]> | null = null;
let _provenance: Record<string, ProvenanceRecord> | null = null;
let _geojson: GeoJSONCollection | null = null;

export async function getPlantations() {
  if (!_plantations) _plantations = await fetchJSON('plantations.json');
  return _plantations!;
}

export async function getOrganizations() {
  if (!_organizations) _organizations = await fetchJSON('organizations.json');
  return _organizations!;
}

export async function getPlaces() {
  if (!_places) _places = await fetchJSON('places.json');
  return _places!;
}

export async function getSources() {
  if (!_sources) _sources = await fetchJSON('sources.json');
  return _sources!;
}

export async function getAppellationsByEntity() {
  if (!_appellationsByEntity)
    _appellationsByEntity = await fetchJSON('appellations-by-entity.json');
  return _appellationsByEntity!;
}

export async function getObservationsByOrg() {
  if (!_observationsByOrg)
    _observationsByOrg = await fetchJSON('observations-by-org.json');
  return _observationsByOrg!;
}

export async function getProvenance() {
  if (!_provenance) _provenance = await fetchJSON('provenance.json');
  return _provenance!;
}

export async function getGeoJSON() {
  if (!_geojson) _geojson = await fetchJSON('map-features.geojson');
  return _geojson!;
}

/** Load all data stores in parallel */
export async function loadAllData() {
  const [
    plantations,
    organizations,
    places,
    sources,
    appellations,
    observations,
    provenance,
    geojson,
  ] = await Promise.all([
    getPlantations(),
    getOrganizations(),
    getPlaces(),
    getSources(),
    getAppellationsByEntity(),
    getObservationsByOrg(),
    getProvenance(),
    getGeoJSON(),
  ]);
  return {
    plantations,
    organizations,
    places,
    sources,
    appellations,
    observations,
    provenance,
    geojson,
  };
}

export type AllData = Awaited<ReturnType<typeof loadAllData>>;

/** Get a short label for a URI */
export function uriLabel(uri: string): string {
  if (uri.includes('wikidata.org/entity/')) return uri.split('/').pop()!;
  if (uri.includes('suriname-timemachine.org/ontology/')) {
    return uri.replace('https://suriname-timemachine.org/ontology/', '');
  }
  return uri;
}

/** Get entity type color */
export function entityTypeColor(typeStr: string): string {
  const colors: Record<string, string> = {
    E24: '#3b82f6', // blue
    E74: '#8b5cf6', // purple
    E53: '#22c55e', // green
    E41: '#f59e0b', // amber
    E22: '#6b7280', // gray
    Observation: '#14b8a6', // teal
    Provenance: '#f43f5e', // rose
  };
  for (const [key, color] of Object.entries(colors)) {
    if (typeStr.includes(key)) return color;
  }
  return '#6b7280';
}

/** Get short type badge label */
export function typeBadge(types: string | string[]): string {
  const arr = Array.isArray(types) ? types : [types];
  if (arr.some((t) => t.includes('Plantation'))) return 'E24';
  if (arr.some((t) => t.includes('E74'))) return 'E74';
  if (arr.some((t) => t.includes('E53'))) return 'E53';
  if (arr.some((t) => t.includes('E41'))) return 'E41';
  if (arr.some((t) => t.includes('E22'))) return 'E22';
  if (arr.some((t) => t.includes('Observation'))) return 'OBS';
  if (arr.some((t) => t.includes('Provenance'))) return 'PROV';
  return '?';
}
