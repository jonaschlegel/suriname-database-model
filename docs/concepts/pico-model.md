# PICO Model

Research notebook, 7 January 2026

---

## Decision

Adopt PICO-compatible terminology. Status: adopted.

| before | after | why |
|--------|-------|-----|
| source_assertion | PersonObservation | Dutch LOD standard |
| person (derived) | PersonReconstruction | clear distinction |
| source_document | Source | consistency |

This enables interoperability with Dutch heritage LOD, easier RDF export, alignment with existing Ward Registers data, potential collaboration with HDSC.

---

## Why looking at this

The Ward Registers (1828-1847) are already published as LOD using extended PICO. This matters because:
- same dataset we want to integrate
- shows how Dutch institutions model historical persons
- extended specifically for enslaved individuals
- team behind it (IISH, Radboud, CBG) are potential collaborators
- not theoretical, working system with 2 million+ triples

---

## What PICO is

Developed by CBG Netherlands, successor to A2A XML standard.

Core insight is distinguishing:
- PersonObservation = how person appears in single source (raw)
- PersonReconstruction = derived entity linking observations believed same person

This maps almost exactly to our source_assertion vs person distinction, except they use RDF not relational.

The three pillars from their docs:
1. PersonObservation - "closely reflect data as it appears in the source, with the age, occupation, spelling recorded as in the record"
2. PersonReconstruction - "result of modelling one or multiple PersonObservation(s) into a single resource"
3. Source - "intangible type to be applied to any archive content"

Same architectural choice we made: keep raw observations separate from interpretations.

---

## Ontologies they use

```
sdo:     schema.org         (most properties)
pnv:     Person Name Vocab  (structured names)
prov:    W3C PROV-O         (provenance)
bio:     BIO ontology       (life events)
picom:   PICO model         (their own classes)
picot:   PICO thesaurus     (controlled vocab)
```

Principle: reuse existing where possible, add own only when necessary.

HDSC extensions for Suriname:
- hdsc:isEnslavedOf (links enslaved to enslaver)
- hdsc:isEnslaverBy (inverse)
- hdsc:kleurling (colonial racial category)
- various address properties

These appear in Ward Register schema. Captures colonial categories we need to represent without endorsing.

---

## Reading the schema

Looking at DataLegend schema images:

Central node is pico:PersonObservation with:
- names (sdo:name, sdo:givenName, sdo:familyName)
- demographics (sdo:gender, pico:hasAge)
- role (pico:hasRole -> picot:490)
- source (prov:hadPrimarySource -> sdo:ArchiveComponent)
- address (sdo:address -> sdo:PostalAddress)
- relationships (sdo:spouse, sdo:parent, sdo:children)

Name structure via pnv:PersonName:
- pnv:givenName
- pnv:baseSurname
- pnv:surnamePrefix (the "van", "de" bits)
- pnv:patronym
- pnv:literalName (full string)

More sophisticated than our simple string approach.

Address also structured:
- hdsc:wijk (ward)
- hdsc:streetName
- hdsc:houseNumber
- sdo:description

Enslavement links via red arrows hdsc:isEnslavedOf connecting PersonObservations. Models relationship explicitly, not hidden in generic field.

Source info on sdo:ArchiveComponent:
- sdo:name
- sdo:holdingArchive (URL)
- sdo:image (scan link)
- sdo:dateCreated

---

## DH Benelux 2025 paper

Mourits et al., "Modelling the enslaved as historical persons" - describes extension work for slavery context.

Authors from IISH (Mourits) and Huygens Institute (Pepping, van Oort, Konings). Same people on HDSC.

https://doi.org/10.5281/zenodo.15586904

---

## Comparison

| | PICO | us |
|-|------|-----|
| paradigm | RDF | relational PostgreSQL |
| obs vs recon | core | same (source_assertion vs person) |
| names | structured PNV | simple string (reconsider?) |
| provenance | PROV-O | custom tables |
| enslavement | explicit properties | not yet modelled |
| roles | thesaurus | not yet |
| addresses | structured | not yet |

What they got right:
- observation/reconstruction split (correct architecture)
- reusing existing ontologies
- thesauri for controlled values
- explicit enslavement relationships

Questions for us:
- adopt their name structure? PNV handles Dutch names well
- use their role thesaurus?
- export to their format?
- contact them?

---

## The datasets

- https://druid.datalegend.net/RJM/Paramaribo-Ward-Registers-1828-1847 (original)
- https://druid.datalegend.net/Posthumus/Paramaribo-Ward-Registers-1828-1847 (teaching copy)

Posthumus copy used for R and LOD course at Radboud. Means teaching materials exist, example SPARQL queries, data actively used.

2,078,149 statements. Substantial.

---

## Implications

Stay relational:
- mirror PICO structure in tables
- adopt naming conventions
- create RDF export scripts
- use their vocabularies

Add RDF/SPARQL:
- import Ward Registers directly
- add our sources in PICO format
- query across with SPARQL
- contribute to Dutch LOD ecosystem

Probably: hybrid. PostgreSQL for storage and complex queries, RDF export for interoperability. Pragmatic.

---

## PNV for names

Dutch names are complex. PNV designed for this:

```turtle
ex:name1 a pnv:PersonName ;
    pnv:literalName "Jan Pieter van der Berg" ;
    pnv:givenName "Jan Pieter" ;
    pnv:surnamePrefix "van der" ;
    pnv:baseSurname "Berg" .
```

Surinamese adds complexity:
- single names (many enslaved)
- owner-derived names after emancipation
- patronymics becoming fixed surnames
- Hindu/Javanese patterns (contract workers)

PNV may not cover all but starting point.

---

## Next

1. read full HLCS paper https://doi.org/10.51964/hlcs19312
2. examine SPARQL queries on DataLegend
3. contact HDSC team
4. decide name structure
5. consider RDF export

---

## Links

docs:
- https://www.personsincontext.org/model/
- https://w3id.org/pnv

papers:
- Woltjer et al. (2024) HLCS https://doi.org/10.51964/hlcs19312
- Mourits et al. (2025) DH Benelux https://doi.org/10.5281/zenodo.15586904

data:
- https://druid.datalegend.net/RJM/Paramaribo-Ward-Registers-1828-1847
- https://hdl.handle.net/10622/VLN8FD

related:
- https://www.ru.nl/hdsc/
- https://cbg.nl/
- https://wiewaswie.nl/

tools:
- https://github.com/ivozandhuis/a2a-to-pico
- https://github.com/CBG-Centrum-voor-familiegeschiedenis/PiCo (SHACL validation)
