# CIDOC-CRM: Notes

> Trying to understand this cultural heritage ontology and whether we should use it.

---

## What Is It?

CIDOC-CRM (Conceptual Reference Model) is an ontology for cultural heritage. It was developed by museum people (CIDOC is the documentation committee of ICOM, the International Council of Museums) and has become an ISO standard.

The basic idea: model the world through **events**. Instead of saying "Jan was born in 1780," you say "there was a Birth event, Jan participated in it, it happened in 1780."

This seems verbose at first, but it lets you:

- Attach uncertainty to different aspects (we know the place but not the date)
- Record who says what (the birth certificate claims X, the family tree says Y)
- Connect events to each other (the birth happened at a plantation, the plantation was owned by...)

---

## Why I Keep Coming Back to It

A lot of the projects I'm learning from use CIDOC-CRM or something compatible:

- Venice Time Machine
- Amsterdam Time Machine
- Europeana
- Various museum databases

If I model my data in a way that maps to CIDOC-CRM, I can potentially exchange data with these projects. Or at least, the concepts I use would be recognisable to people familiar with cultural heritage informatics.

Also, the event-based approach fits our problem well. We're not trying to establish "the truth" about people and places. We're trying to capture what different sources say, when they say it, and how confident we are.

---

## The Core Concept: Events

In a typical database, you might have:

```sql
CREATE TABLE person (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    birth_date DATE,
    death_date DATE
);
```

In CIDOC-CRM thinking:

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

Yes, this is more complex. But now I can say things like:

- The birth event is documented by this death certificate (E31 Document, P70 documents)
- The birth event took place at this location (E53 Place, P7 took place at)
- Someone interpreted the document and concluded this birth event happened (E13 Attribute Assignment)

---

## Key Classes

I've been using these ones mentally:

| Class                    | What It Represents | Our Equivalent       |
| ------------------------ | ------------------ | -------------------- |
| E21 Person               | Individual human   | person table         |
| E53 Place                | Location           | place table          |
| E67 Birth                | Birth event        | birth_certificate?   |
| E69 Death                | Death event        | death_certificate?   |
| E22 Human-Made Object    | Physical thing     | map, document        |
| E5 Event                 | General happening  | event table          |
| E13 Attribute Assignment | Interpretation     | interpretation table |

**E13 Attribute Assignment** is particularly important for us. It's the formal way of saying "someone (E39 Actor) at some time assigned this property to this thing." It's how you model interpretations.

---

## Mapping My Tables

I tried mapping our emerging schema to CIDOC-CRM. Roughly:

**person** → E21 Person

- The person themselves are E21
- Their name is E41 Appellation, assigned via E15 Identifier Assignment
- Multiple names = multiple E15 events

**place** → E53 Place

- The place itself is E53
- Its name is E44 Place Appellation
- Its geometry is... here it gets tricky

**map_feature** → E25 Human-Made Feature (maybe?)

- The polygon I traced is a feature on a physical map
- The physical map is E22 Human-Made Object

**interpretation** → E13 Attribute Assignment

- "I claim this map_feature represents this place" is an E13 event
- The E13 is carried out by a person (P14), at a time (P4), with a certain reliability

---

## Problems I'm Having

### The Geometry Problem

CIDOC-CRM has E53 Place (location) and E94 Space Primitive (coordinates). But it doesn't have a native way to say "this polygon represents the boundary of this place at this time."

There's an extension called CRMgeo that connects CIDOC-CRM to GeoSPARQL. But I haven't fully understood it yet.

**Current approach:** Don't try to model geometry in pure CIDOC-CRM. Keep it in PostGIS, export to RDF without the spatial bits.

### The Verbosity Problem

A single birth record becomes dozens of triples:

```turtle
:PERS_0001 a crm:E21_Person .
:BIRTH_0001 a crm:E67_Birth ;
    crm:P98_brought_into_life :PERS_0001 ;
    crm:P4_has_time-span :TS_0001 .
:TS_0001 a crm:E52_Time-Span ;
    crm:P82_at_some_time_within "1780-01-15"^^xsd:date .
```

And that's without mother, father, location, source, uncertainty...

I don't think I want to store data in this format. But I could generate it for export.

### The Learning Curve Problem

CIDOC-CRM has 81 classes and 160 properties in the current version. Plus extensions like CRMsoc (social phenomena), CRMgeo (geo), CRMdig (digital).

I've read the spec multiple times and I still have to look things up constantly.

---

## What I Think We Should Do

1. **Don't use CIDOC-CRM as the primary data model.** PostgreSQL tables are more practical for our needs.

2. **Design with CIDOC-CRM compatibility in mind.** Make sure our concepts can be mapped:

   - Have an event-based interpretation layer
   - Track provenance (who said what when)
   - Distinguish between things and their names

3. **Create CIDOC-CRM mappings for export.** Document which of our tables/columns map to which CIDOC-CRM classes/properties.

4. **Learn the key patterns.** Even if we don't use CIDOC-CRM directly, the event-centric thinking is useful.

---

## The Event-Centric Principle (Worth Internalising)

The more I think about it, the more I think this is the right way to model historical data:

**Instead of:** A person HAS a birth date (property of the person)
**Think:** A birth event HAPPENED, the person participated, the event has a date

Why? Because:

- Multiple sources might give different birth dates
- We might know the place but not the date
- We can track who recorded this information and when
- The event can have its own properties (attendees, documentation)

I'm trying to apply this principle even where I don't use CIDOC-CRM syntax.

---

## Places I've Found Helpful

**CIDOC-CRM Official Site** - https://www.cidoc-crm.org/
The spec is dense but authoritative. Version 7.1.3 is current.

**Linked.art** - https://linked.art/
CIDOC-CRM profile for art museums. They've made sensible simplifications. Good examples.

**ResearchSpace** - https://www.researchspace.org/
British Museum project using CIDOC-CRM. Has tutorials.

**Doerr, Martin.** "The CIDOC CRM: An Ontological Approach to Semantic Interoperability of Metadata." _AI Magazine_ 24, no. 3 (2003).
The paper introducing CIDOC-CRM. More accessible than the spec.

---

## Next Steps for Me

- [ ] Read the Linked.art documentation more carefully (they've solved some problems I'm stuck on)
- [ ] Try modelling one death certificate end-to-end in CIDOC-CRM to see how it feels
- [ ] Look at how Enslaved.org maps to CIDOC-CRM (if they do)
- [ ] Figure out the geometry question (CRMgeo or just give up)

---

_Last edited: 2025-01-06_
