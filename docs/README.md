# Suriname Database Model Documentation

> A comprehensive documentation repository for the Suriname Time Machine database project, combining data modeling research, comparative analysis of database paradigms, and incremental design documentation.

## Documentation Structure

```
docs/
├── README.md                    # This file - documentation overview
├── references.md                # Academic citations (BibTeX format)
│
├── data-sources/                # Inventory of all datasets
│   ├── 00-overview.md           # Summary of all data sources
│   ├── 01-plantagen-dataset.md  # Suriname Plantagen Dataset
│   ├── 02-death-certificates.md # Death Certificates 1845-1915
│   ├── 03-birth-certificates.md # Birth Certificates 1828-1921
│   ├── 04-ward-registers.md     # Ward Registers 1828-1847
│   ├── 05-slave-emancipation.md # Slave & Emancipation Registers
│   ├── 06-almanakken.md         # Surinaamse Almanakken
│   ├── 07-qgis-maps.md          # QGIS Geographic Data
│   └── 08-wikidata.md           # Wikidata Integration
│
├── concepts/                    # Theoretical foundations
│   ├── relational-databases.md  # Relational model theory
│   ├── linked-open-data.md      # W3C LOD principles
│   ├── cidoc-crm.md             # CIDOC-CRM for cultural heritage
│   └── time-machine-projects.md # Existing Time Machine projects
│
├── models/                      # Data models and diagrams
│   ├── current-state/           # As-is diagrams of source data
│   ├── conceptual/              # High-level entity diagrams
│   ├── logical/                 # Detailed relational models
│   └── physical/                # Implementation-specific schemas
│
└── decisions/                   # Architecture Decision Records (ADRs)
    └── 0001-documentation-approach.md
```

## Project Goals

1. **Document existing datasets** - Understand structure, content, and relationships
2. **Learn data modeling** - Study relational, LOD, and CIDOC-CRM approaches
3. **Design incrementally** - Build models step-by-step with rationale
4. **Enable reproducibility** - All decisions documented with citations

## How to Read This Documentation

1. Start with [data-sources/00-overview.md](data-sources/00-overview.md) for dataset inventory
2. Read individual dataset documentation to understand source structures
3. Explore [concepts/](concepts/) for theoretical background
4. Review [models/](models/) for evolving database designs
5. Check [decisions/](decisions/) for architectural rationale

## Quick Links

- [References & Citations](references.md)
- [Data Sources Overview](data-sources/00-overview.md)
- [Current Entity-Relationship Diagrams](models/current-state/)

---

_Last updated: 2026-01-06_
