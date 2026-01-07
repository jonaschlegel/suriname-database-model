# CIDOC-CRM

Notes on the cultural heritage ontology. Do we use it?

---

## What it is

CIDOC-CRM (Conceptual Reference Model) is an ontology for cultural heritage. Developed by museum people (CIDOC is the documentation committee of ICOM). It is an ISO standard.

Basic idea: model the world through events. Instead of "Jan was born in 1780" you say "there was a Birth event, Jan participated, it happened in 1780."

Seems verbose but lets you:

- attach uncertainty to different aspects (know place but not date)
- record who says what (certificate claims X, family tree says Y)
- connect events (birth at plantation, plantation owned by...)

---

## Why keep coming back to it

Projects I am learning from use CIDOC-CRM or compatible:

- OpenAtlas with project INDIGO
- Venice Time Machine
- Amsterdam Time Machine
- Europeana
- various museum databases

If data maps to CIDOC-CRM, can exchange with these projects. Concepts recognisable to cultural heritage informatics people.

Event-based approach fits our problem. Not trying to establish "truth" about people and places. Trying to capture what sources say, when, how confident.

---

## The core concept: events

Typical database:

```sql
CREATE TABLE person (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    birth_date DATE,
    death_date DATE
);
```

CIDOC-CRM thinking:

```
Person (E21)
    ↑
    | was born (P98i)
    ↓
Birth Event (E67)
    ↓
    | has time-span (P4)
    ↓
Time-Span (E52)
    ↓
    | at some time within (P82)
    ↓
"1780-01-15"
```

More complex but now can say:

- birth documented by this death certificate (E31 Document, P70 documents)
- birth took place at this location (E53 Place, P7 took place at)
- someone interpreted document and concluded this birth happened (E13 Attribute Assignment)

---

## Key classes

| class                    | represents        | our equivalent       |
| ------------------------ | ----------------- | -------------------- |
| E21 Person               | individual human  | person table         |
| E53 Place                | location          | place table          |
| E67 Birth                | birth event       | birth_certificate?   |
| E69 Death                | death event       | death_certificate?   |
| E22 Human-Made Object    | physical thing    | map, document        |
| E5 Event                 | general happening | event table          |
| E13 Attribute Assignment | interpretation    | interpretation table |

E13 Attribute Assignment particularly important. Formal way of saying "someone (E39 Actor) at some time assigned this property to this thing." How you model interpretations.

---

## Mapping our tables

Roughly:

person → E21 Person

- name is E41 Appellation via E15 Identifier Assignment
- multiple names = multiple E15 events

place → E53 Place

- name is E44 Place Appellation
- geometry... tricky

map_feature → E25 Human-Made Feature (maybe?)

- polygon traced is feature on physical map
- physical map is E22 Human-Made Object

interpretation → E13 Attribute Assignment

- "I claim this map_feature represents this place" is E13 event
- carried out by person (P14), at time (P4), with reliability

---

## Problems

Geometry:

- E53 Place and E94 Space Primitive exist
- no native way to say "this polygon represents boundary of this place at this time"
- CRMgeo extension connects to GeoSPARQL but haven't fully understood
- current approach: don't model geometry in pure CIDOC-CRM, keep in PostGIS, export to RDF without spatial bits

Verbosity:

- single birth record becomes dozens of triples
- don't want to store in this format but could generate for export

Learning curve:

- 81 classes and 160 properties in current version
- plus extensions (CRMsoc, CRMgeo, CRMdig)
- read spec multiple times, still look things up constantly

---

## What we should do

1. don't use CIDOC-CRM as primary data model. PostgreSQL tables more practical.

2. design with compatibility in mind:

   - event-based interpretation layer
   - track provenance
   - distinguish things from names

3. create CIDOC-CRM mappings for export. document which tables/columns map to which classes/properties.

4. learn key patterns. event-centric thinking useful even without CIDOC-CRM syntax.

---

## The event-centric principle

Worth internalising:

Instead of: person HAS birth date (property)
Think: birth event HAPPENED, person participated, event has date

Why:

- multiple sources might give different birth dates
- might know place but not date
- can track who recorded this and when
- event can have own properties (attendees, documentation)

Applying this principle even where not using CIDOC-CRM syntax.

---

## Links

- https://www.cidoc-crm.org/ (spec, version 7.1.3, ISO 21127:2014)
- https://linked.art/ (CIDOC-CRM profile for art museums, good examples)
- https://www.researchspace.org/ (British Museum project, tutorials)

Papers:

- Doerr (2003) "The CIDOC CRM: An Ontological Approach" AI Magazine
- Meroño-Peñuela et al. (2015) "Semantic Technologies for Historical Research" Semantic Web
- Theodoridou et al. (2010) "Modeling and Querying Provenance by Extending CIDOC CRM"

---

## Next

- read Linked.art docs more carefully
- try modelling one death certificate end-to-end
- look at how Enslaved.org maps to CIDOC-CRM
- figure out geometry question (CRMgeo or give up)

---

7 January 2026
