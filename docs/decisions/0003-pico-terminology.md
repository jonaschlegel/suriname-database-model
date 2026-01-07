# ADR-0003: PICO Terminology

Status: accepted
Date: 2026-01-07

---

## Context

Need terminology for core concepts, particularly distinguishing raw source data from derived/reconstructed entities.

PICO (Persons in Context) is Dutch standard for historical person data in LOD. Ward Registers already published using PICO on DataLegend.

---

## Decision

Adopt PICO-compatible terminology:

| concept | PICO term | previous term |
|---------|-----------|---------------|
| raw person data from source | PersonObservation | source_assertion |
| derived/linked identity | PersonReconstruction | person |
| archival record | Source | source_document |

Plan for RDF/PICO export to enable interoperability with WieWasWie, World Historical Gazetteer, DataLegend, other Dutch heritage LOD.

---

## Rationale

for:
- interoperability (Ward Registers already in PICO)
- collaboration (HDSC team uses PICO)
- standards (successor to A2A, adopted by CBG and Dutch archives)
- clarity (observation/reconstruction distinction explicit in terms)
- export path (terminology alignment makes RDF export straightforward)

against (considered):
- learning curve (mitigated by documentation)
- not pure relational (terminology can transfer, structure adapts)
- overhead (accepted as worthwhile for interop)

---

## Consequences

immediate:
- update documentation
- rename tables/columns in schema drafts
- update competency questions and trace examples

medium-term:
- design RDF/JSON-LD export
- implement export
- validate against PICO SHACL shapes

long-term:
- contribute to Dutch LOD ecosystem
- potential WHG contribution
- collaborative person linking with HDSC

---

## Related

- ADR-0004 (pending): Linked Places Format
- ADR-0005 (pending): name structure (PNV or extension)

---

## Links

- https://www.personsincontext.org/model/
- https://doi.org/10.51964/hlcs19312
- https://druid.datalegend.net/RJM/Paramaribo-Ward-Registers-1828-1847
- https://doi.org/10.5281/zenodo.15586904
