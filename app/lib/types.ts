// Entity types matching the JSON-LD database structure

export interface MapDepiction {
  mapId: string;
  labelOnMap: string;
  hasPolygon?: boolean;
  P70i_is_documented_in?: string;
}

export interface E24Plantation {
  '@id': string;
  '@type': string[];
  status: string;
  prefLabel: string;
  P52_has_current_owner?: string;
  P51_has_former_or_current_owner?: string;
  P53_has_location?: string;
  P1_is_identified_by?: string | string[];
  'stm:depictedOnMap'?: MapDepiction[];
  wasDerivedFrom?: string;
}

export interface E74Organization {
  '@id': string;
  '@type': string[];
  additionalType?: string;
  prefLabel: string;
  psurId?: string;
  absorbedInto?: string;
  sameAs?: string;
  wasDerivedFrom?: string;
}

export interface Geometry {
  '@type'?: string;
  asWKT: string;
  geometrySource?: string;
}

export interface E53Place {
  '@id': string;
  '@type': string[];
  fid: number;
  mapYear: string;
  observedLabel?: string;
  hasGeometry?: Geometry;
  P70i_is_documented_in?: string;
  wasDerivedFrom?: string;
}

export interface E41Appellation {
  '@id': string;
  '@type': string[];
  P190_has_symbolic_content: string;
  P72_has_language?: string;
  P128i_is_carried_by?: string;
  P1i_identifies?: string;
  P139_has_alternative_form?: string;
  mapYear?: string;
}

export interface E22Source {
  '@id': string;
  '@type': string[];
  prefLabel: string;
  P2_has_type?: string;
  mapId?: string;
  mapYear?: string;
  sameAs?: string;
}

export interface OrganizationObservation {
  '@id': string;
  '@type': string[];
  observationOf: string;
  observationYear: string;
  observedName?: string;
  hasOwner?: string;
  hasAdministrator?: string;
  hasDirector?: string;
  product?: string;
  enslavedCount?: number;
  deserted?: boolean;
  locationStd?: string;
  sizeAkkers?: number;
  freeResidentsCount?: number;
  pageReference?: string;
  hadPrimarySource?: string;
  wasDerivedFrom?: string;
}

export interface ProvenanceRecord {
  '@id': string;
  '@type': string[];
  sourceFile: string;
  sourceColumn?: string;
  sourceRow?: string;
  transformedBy?: string;
  modelEntity?: string;
  schemaTable?: string;
  linkedVia?: string;
}

export interface GeoJSONFeatureProperties {
  fid: number;
  name: string;
  status: string;
  mapYear: string;
  plantationUri: string;
  organizationQid?: string;
  placeUri: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: GeoJSONFeatureProperties;
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  name: string;
  crs?: unknown;
  features: GeoJSONFeature[];
}

// Union type for entity lookups
export type Entity =
  | E24Plantation
  | E74Organization
  | E53Place
  | E41Appellation
  | E22Source
  | OrganizationObservation
  | ProvenanceRecord;
