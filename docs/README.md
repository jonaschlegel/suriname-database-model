# Suriname Database Model

Documentation for the Suriname Time Machine database project. Combining data modelling research with incremental design.

---

## Structure

```
docs/
├── data-sources/    datasets we are integrating
├── concepts/        theoretical background, research notes
├── models/          schema designs, trace examples, testing
├── collaboration/   questions for external teams
├── decisions/       architecture decision records
└── references.md    citations
```

---

## Data sources

9 datasets, ~475,000 records, 1700-1935

see data-sources/00-overview.md

---

## Current thinking

Using PICO-compatible terminology (PersonObservation, PersonReconstruction, Source). See concepts/pico-model.md

Hybrid approach: PostgreSQL for storage and queries, RDF export for interoperability with Dutch LOD ecosystem.

Location model using Linked Places Format concepts. See concepts/linked-places-format.md

---

## Key documents

- data-sources/00-overview.md (what we have)
- concepts/pico-model.md (person modelling)
- concepts/linked-places-format.md (location modelling)
- models/trace-examples.md (real records through the model)
- models/testing-strategy.md (how we validate)
- collaboration/hdsc-questions.md (questions for HDSC team)

---

## Navigation

Start with data sources overview to understand what we are integrating. Then concepts/ for background. models/ for actual schema work. decisions/ for architectural choices.

---

7 January 2026
