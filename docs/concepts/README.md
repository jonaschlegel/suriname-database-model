# Concepts Directory

This directory contains theoretical foundations, ethical guidelines, and background research for the database design.

## Structure

```
concepts/
├── README.md                    # This file
├── ethical-framework.md         # Guidelines for colonial archival data
├── relational-databases.md      # Relational model theory
├── linked-open-data.md          # W3C LOD principles
├── cidoc-crm.md                 # Cultural heritage ontology
├── pico-model.md                # Persons in Context (Dutch LOD standard)
├── linked-places-format.md      # Linked Places / NL-LP for locations
├── time-machine-projects.md     # Precedent projects
├── w3c-web-annotations.md       # re:Charted and annotation integration
├── visualization-guide.md       # How to view and create diagrams
├── source-to-model.md           # Transformation documentation
└── references.md                # Working bibliography
```

## Document Overview

### Ethical Framework

[ethical-framework.md](./ethical-framework.md) - Guidelines for responsible handling of colonial archival data:

- Centering personhood over property records
- Bias recognition in colonial sources
- Uncertainty documentation
- Descendant considerations

### Technical Foundations

| Document                                             | Description                                        |
| ---------------------------------------------------- | -------------------------------------------------- |
| [relational-databases.md](./relational-databases.md) | Normalization, keys, constraints, PostgreSQL types |
| [linked-open-data.md](./linked-open-data.md)         | RDF, JSON-LD, SPARQL, Wikidata integration         |
| [cidoc-crm.md](./cidoc-crm.md)                       | Event-based cultural heritage ontology             |
| [pico-model.md](./pico-model.md)                     | Dutch standard for historical persons (LOD)        |
| [linked-places-format.md](./linked-places-format.md) | Linked Places / NL-LP for temporal locations       |
| [w3c-web-annotations.md](./w3c-web-annotations.md)   | re:Charted tool, AnnoRepo, IIIF integration        |

### Methodology

| Document                                           | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- |
| [visualization-guide.md](./visualization-guide.md) | How to view Mermaid diagrams, tools for ERDs       |
| [source-to-model.md](./source-to-model.md)         | How original data transforms into normalized model |

### Context and Precedents

[time-machine-projects.md](./time-machine-projects.md) - Survey of related projects:

- Venice Time Machine, Amsterdam Time Machine
- Enslaved.org, Slave Voyages, Freedom on the Move
- GLOBALISE project (Dutch colonial archives)

## Reading Order

### For Database Design

1. **Ethical Framework** - Read first: shapes all design decisions
2. **Relational Databases** - Core theory and PostgreSQL specifics
3. **Source to Model** - How we transform data, preserving traceability
4. **CIDOC-CRM** - Event-based modeling for cultural heritage

### For Interoperability

1. **Linked Open Data** - W3C standards, Wikidata, RDF
2. **W3C Web Annotations** - re:Charted integration, IIIF
3. **Time Machine Projects** - Learn from similar initiatives

### For Working with Diagrams

1. **Visualization Guide** - How to view and create diagrams

## Status

| Document              | Status   | Notes                            |
| --------------------- | -------- | -------------------------------- |
| Ethical Framework     | Complete | Core principles established      |
| Relational Databases  | Complete | PostgreSQL-focused               |
| Linked Open Data      | Complete | JSON-LD, SPARQL, Wikidata        |
| CIDOC-CRM             | Complete | Mapping patterns included        |
| Time Machine Projects | Complete | 6 projects surveyed              |
| W3C Web Annotations   | Complete | re:Charted integration spec      |
| Visualization Guide   | Complete | Mermaid, dbdiagram.io, tools     |
| Source to Model       | Complete | Transformation patterns, tracing |

---

7 January 2026
