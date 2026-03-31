# Validation Checklist

Quick reference for validating plantation data entities.

## Plantation (E24 Physical Human-Made Thing) - MAIN ENTITY

- [ ] Type: `crm:E24_Physical_Human-Made_Thing`
- [ ] URI = `{base}plantation/{name-slug}`
- [ ] `skos:prefLabel` with `@nl` tag
- [ ] `crm:P2_has_type` with `type/plantation-status/*` value
- [ ] `crm:P53_has_location` linking to E53 Place
- [ ] `crm:P52_has_current_owner` linking to Organization (Q-ID)
- [ ] `prov:wasDerivedFrom` linking to source
- [ ] `crm:P124i_was_transformed_by` E81 Transformation if merged

## Location (E53 Place)

- [ ] Type: `crm:E53_Place`
- [ ] URI = `{base}place/{year}/fid-{fid}`
- [ ] `crm:P48_has_preferred_identifier` E42 Identifier (QGIS feature ID)
- [ ] `crm:P1_is_identified_by` E41 Appellation (map label)
- [ ] `geo:hasGeometry` with `geo:asWKT` polygon

## Organization (E74 / sdo:Organization)

- [ ] URI = Wikidata Q-ID (`wd:Qxxxxxxx`)
- [ ] Types: `sdo:Organization` or `crm:E74_Group`
- [ ] `sdo:additionalType wd:Q188913`
- [ ] `skos:prefLabel` with `@nl` tag
- [ ] `crm:P99i_was_dissolved_by` E68 Dissolution if dissolved

## Qualified Links (for uncertain matches)

- [ ] `crm:P140_assigned_attribute_to` linking to E24
- [ ] `crm:P141_assigned` linking to Q-ID
- [ ] `crm:P2_has_type` (Certain / Probable / Uncertain)
- [ ] `crm:P3_has_note` explanation

## Observations (from Almanakken)

- [ ] Type: `crm:E13_Attribute_Assignment`
- [ ] `crm:P140_assigned_attribute_to` linking to Organization (Q-ID)
- [ ] `crm:P4_has_time-span` E52 Time-Span (year)
- [ ] `prov:hadPrimarySource` linking to almanac source

## Source Documents (E22)

- [ ] Type: `crm:E22_Human-Made_Object`
- [ ] `crm:P128_carries` linking to E36 Visual Item
- [ ] E36 uses `crm:P138_represents` to E24 Plantation (NOT to E53 directly)
- [ ] Digital scans: E38 Image `crm:P138_represents` the E22
