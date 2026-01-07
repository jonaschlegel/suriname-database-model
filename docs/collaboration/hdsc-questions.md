# HDSC Collaboration

Questions and notes for discussion with the HDSC team at Radboud. They already published the Ward Registers as LOD using PICO, so they have solved problems we are still thinking about.

Contact: slavenregisters@let.ru.nl (Dr. Coen van Galen)

---

## Schema questions

PersonObservation vs PersonReconstruction workflow

- when do they decide to create a PersonReconstruction? some threshold?
- what if a reconstruction turns out wrong later? can you split one?
- do they store candidate matches before committing?
- we have ~475k records, need scalable approach that preserves uncertainty

Enslavement relationships

- Ward Registers use hdsc:isEnslavedOf and hdsc:isEnslaverBy
- cannot find formal HDSC ontology documented anywhere
- how do they handle temporal changes? sold, inherited, freed
- collective ownership? estates, companies vs individual owners

Names for enslaved people

- PNV assumes given name + family name structure
- but enslaved often had single names only
- African day-names like Kwamina, Adjua
- names assigned by enslavers
- name changes at emancipation
- how do they categorise these? is Kwamina a "given name"?

Occupation

- hasOccupation sits on PersonObservation in their schema
- same person different occupations in different sources
- colonial-specific terms like "timmerneger" (enslaved carpenter)
- controlled vocabulary? how aggregate to PersonReconstruction?

Addresses

- Ward Registers have detailed Paramaribo addresses (wijk, street, house number)
- hdsc:wijk, hdsc:streetName in schema
- is there a gazetteer linking these?
- using Linked Places Format?

---

## Technical questions

Performance

- 2 million+ triples in Ward Registers
- what triplestore? Blazegraph, Virtuoso, other?
- we will have more data with complex cross-source queries
- do they keep relational copy for some queries?

Reconciliation

- person linking is our biggest challenge
- automated matching algorithms?
- manual review process?
- how track confidence?

Versioning

- how handle updates when transcriptions corrected?
- version history on observations?
- what happens to reconstructions when underlying observations change?

---

## Collaboration possibilities

Shared vocabularies

- occupation types (Surinamese historical context)
- relationship types (enslavement-specific)
- place types (plantation, lot, ward)
- interested in collaborating on these?

Cross-source matching

- slave registers, death certs, ward registers overlap in time and population
- have they attempted this? results?
- coordinate on person URIs?

Geographic data

- we have ~300 QGIS map features from historic maps
- do they have georeferenced plantation/ward data?
- shared gazetteer project?

---

## Issues we spotted in PICO/HDSC schema

Things that might need extending:

- no uncertainty property on PersonObservation (but transcriptions can be uncertain)
- binary gender (sdo:Male, sdo:Female) but sources sometimes ambiguous
- single occupation per observation, some sources list multiple
- relationships like spouse/parent have no temporal qualification

If we extend, would propose:

- certainty on observation or specific properties
- extended relationship types for slavery
- name type vocabulary for colonial naming patterns
- temporal qualification on relationships

---

## Meeting notes

(to fill in after discussions)

---

## Links

- https://www.personsincontext.org/model/
- https://druid.datalegend.net/RJM/Paramaribo-Ward-Registers-1828-1847
- https://www.ru.nl/hdsc/
- https://doi.org/10.5281/zenodo.15586904 (DH Benelux 2025 paper)

---

7 January 2026
