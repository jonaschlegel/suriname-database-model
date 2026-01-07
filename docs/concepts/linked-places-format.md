# Linked Places Format

Research notebook, 7 January 2026

---

## Why this matters

Our location problem: historical places change over time. Plantation boundaries shift. Names change spelling. Administrative units merge and split. The 1763 map shows something different from the 1861 map.

Linked Places Format (LPF) designed exactly for this. International standard for historical gazetteers, used by World Historical Gazetteer and Pelagios Network.

NL-LP (Nederlands profiel voor Linked Places) is Dutch profile, by Geonovum, RCE, and KNAW Humanities Cluster. Relevant because:
- designed for Dutch heritage data
- partners include institutions we might work with
- addresses same "places in time" problem

---

## Core insight

In standard GIS, a place has coordinates. Done.

In LPF, a place can have:
- multiple names, each with own time period and citation
- multiple geometries, each valid for different period
- multiple types, changing over time (village -> town -> city)
- multiple relations to other places, scoped in time

The "when" element is the key. Can attach to almost anything.

---

## Structure

A place in LPF is a GeoJSON Feature with extensions:

```json
{
  "@id": "http://example.org/places/de_hoop",
  "type": "Feature",
  "properties": {
    "title": "De Hoop",
    "ccodes": ["SR"],
    "fclasses": ["S"]
  },
  "when": {
    "timespans": [{"start": {"in": "1700"}, "end": {"in": "1863"}}]
  },
  "names": [
    {
      "toponym": "De Hoop",
      "lang": "nl",
      "when": {"timespans": [{"start": {"in": "1750"}}]},
      "citations": [{"label": "Slave Register 1830", "@id": "..."}]
    }
  ],
  "geometry": {
    "type": "Polygon",
    "coordinates": [...],
    "when": {"timespans": [{"start": {"in": "1763"}}]},
    "certainty": "less-certain"
  }
}
```

One record captures:
- spelling variants with sources
- different boundary polygons from different maps, different certainties
- place type with validity period
- administrative hierarchy

---

## Key elements

when{}
- timespans: array of start/end
- periods: named periods (links to PeriodO etc)
- certainty: certain / less-certain / uncertain
- duration: e.g. P100Y for 100 years

Timespan bounds:
- in = exact date (ISO 8601)
- earliest = no earlier than
- latest = no later than

names[]
- toponym, lang, citations, when

geometry{}
- GeoJSON with optional when, certainty, geowkt

types[]
- identifier (AAT URI), label, when

relations[]
- relationType (Getty vocab), relationTo (URI), when

fclasses[]
- A = administrative
- H = water bodies
- L = regions/landscapes
- P = populated places
- R = roads/routes
- S = sites (buildings)
- T = landforms

---

## NL-LP specifics

Dutch profile adds:
- NEN 3610 alignment (Dutch geo standards)
- Getty AAT types subset
- no GeometryCollection (cleaner)
- attestation model from Linked Pasts Ontology

Attestations:
- lpo:NameAttestation (name as attested in source)
- lpo:TypeAttestation
- lpo:RelAttestation
- lpo:LinkAttestation

Similar to PICO PersonObservation: raw data from source, separate from interpreted entity.

---

## Mapping to our model

| us | LPF |
|----|-----|
| Place | Feature (abstract place) |
| map_feature | geometry with when + citation |
| interpretation | implicit in LPF structure |

Difference: LPF bundles everything in one Feature, we separate map_feature from place with explicit interpretation table. Our approach more explicit about uncertainty and interpretation step.

Options:
- export to LPF (keep relational, generate for interop)
- store as LPF (RDF primary, SPARQL queries)
- hybrid (relational for complex queries, LPF for sharing)

Probably hybrid. Same conclusion as with PICO.

---

## World Historical Gazetteer

https://whgazetteer.org/

Run by Pittsburgh with international partners including KNAW.

Features:
- upload LPF or LP-TSV
- reconciliation against Wikidata, Getty TGN, GeoNames
- temporal visualisation
- API

Could contribute Surinamese historical places.

---

## Links

standards:
- https://github.com/LinkedPasts/linked-places-format
- https://geonovum.github.io/geooptijd/ (NL-LP)
- https://github.com/LinkedPasts/linked-pasts-ontology

platforms:
- https://whgazetteer.org/
- https://pelagios.org/
- https://hisgis.nl/

Dutch:
- https://www.geonovum.nl/
- https://netwerkdigitaalerfgoed.nl/

---

## Questions for HDSC

- using LPF/NL-LP for location data?
- how handle Place vs Depiction distinction?
- contributed to World Historical Gazetteer?
- how PICO for persons integrates with LPF for places?
