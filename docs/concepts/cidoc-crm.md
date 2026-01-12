# CIDOC-CRM

Notes, thoughts and resources on the cultural heritage ontology.

---

## What it is

CIDOC-CRM (Conceptual Reference Model) is an ontology for cultural heritage. Developed by museum people (CIDOC is the documentation committee of ICOM). It is an ISO standard.

Basic idea: model the world through events. Instead of "Jan was born in 1780" you say "there was a Birth event, Jan participated, it happened in 1780."

Seems verbose but lets you:

- attach uncertainty to different aspects (know place but not date)
- record who says what (certificate claims X, family tree says Y)
- connect events (birth at plantation, plantation owned by...)

---

## Why using it

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

E13 Attribute Assignment https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E13 particularly important. Formal way of saying "someone (E39 Actor) at some time assigned this property to this thing." How you model interpretations.

---

## Mapping our tables

Roughly:

person → E21 Person https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E21

- name is E41 Appellation https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E41 via E15 Identifier Assignment http://cidoc-crm.org/cidoc-crm/7.1.3/E15_Identifier_Assignment
- multiple names = multiple E15 events

place → E53 Place https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E53

map_feature → E22 Human-Made Object https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E22 (maybe? Or rather E24 Physical Human-Made Thing?)

- polygon traced is feature (digital, or analog on the actual map?) on physical map, so a E25: Hamn-Made Feature https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E25
- physical map is E22 Human-Made Object https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E22

interpretation → E13 Attribute Assignment https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E13

- "I claim this map_feature represents this place" is E13 event https://cidoc-crm.org/html/cidoc_crm_v7.1.3.html#E13
- carried out by person (P14), at time (P4), with reliability

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
- https://www.researchspace.org/ (British Museum project, tutorials, and really great tool/space)

Papers:

- Doerr (2003) "The CIDOC CRM: An Ontological Approach" AI Magazine
- Meroño-Peñuela et al. (2015) "Semantic Technologies for Historical Research" Semantic Web
- Theodoridou et al. (2010) "Modeling and Querying Provenance by Extending CIDOC CRM"

---

## Datasprint approach

Interesting idea from GLOBALISE: they ran a datasprint on historical maps with three parallel sessions (Leon wrote on it in the blog post, link below):

1. georeferencing (using Allmaps, produced 48 georeferenced maps in one afternoon)
2. data extraction (annotating visual features in Recogito, ~500 annotations)
3. data linking (uploading curated place data to World Historical Gazetteer)

See: https://globalise.huygens.knaw.nl/old-maps-new-discoveries-a-datasprints-digital-exploration/

What to consider to do for here, as it has similar challenges: name variants, changing boundaries, linking places across sources:

- combine Atlas of Mutual Heritage metadata with National Archives IIIF images
- link from IIIF Manifests to structured RDF using rdfs:seeAlso
- critical discussion about map reliability (coastlines often sketchy, projections vary)
- bottom-up annotation then standardisation (tag first, define vocabulary after)

---

## Tools to use when reconstruction a model following the CIDOC CRM

- The CIDOC CRM periodic table: https://remogrillo.github.io/cidoc-crm_periodic_table/?code=E1
- X3ML mapping tool: https://rdamsc.bath.ac.uk/msc/m114
- Latest release: https://cidoc-crm.org/get-last-official-release
- With explanations: https://cidoc-crm.org/html/cidoc_crm_v7.1.3_with_translations.html#E1
