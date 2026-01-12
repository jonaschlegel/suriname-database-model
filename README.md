# Suriname Time Machine Database Model

> A comprehensive database design project for integrating historical Suriname datasets, with a focus on data provenance tracking, academic rigor, and Linked Open Data principles.

## Project Goals

1. **Integrate historical datasets** — Plantations, vital records, enslaved persons, maps
2. **Track data provenance** — Every piece of data traces back to its source
3. **Learn data modeling** — Document relational, LOD, and CIDOC-CRM approaches
4. **Build incrementally** — Step-by-step design with full documentation

## Dataset Data Sources

| Dataset                                                            | Records | Period    | Primary Entity      |
| ------------------------------------------------------------------ | ------- | --------- | ------------------- |
| [Plantagen Dataset](docs/data-sources/01-plantagen-dataset.md)     | 375     | 1700–1863 | Plantations         |
| [Death Certificates](docs/data-sources/02-death-certificates.md)   | 192,335 | 1845–1915 | Vital records       |
| [Birth Certificates](docs/data-sources/03-birth-certificates.md)   | 63,200  | 1828–1921 | Vital records       |
| [Ward Registers](docs/data-sources/04-ward-registers.md)           | 102,260 | 1828–1847 | Census data         |
| [Slave & Emancipation](docs/data-sources/05-slave-emancipation.md) | 95,388  | 1830–1863 | Enslaved persons    |
| [Almanakken](docs/data-sources/06-almanakken.md)                   | 22,000  | 1819–1935 | Plantation records  |
| [QGIS Maps](docs/data-sources/07-qgis-maps.md)                     | ~300    | 1763–1861 | Geographic features |
| [Wikidata](docs/data-sources/08-wikidata.md)                       | —       | —         | External references |

**Total:** ~475,000+ records across 8 data sources

## Documentation Structure

```
docs/
├── README.md                    # Documentation overview
├── references.md                # Academic citations (BibTeX)
├── data-sources/                # Dataset documentation
├── concepts/                    # Theoretical foundations (TODO)
├── models/                      # Data models & diagrams (TODO)
└── decisions/                   # Architecture Decision Records
```

**Start here:** [docs/README.md](docs/README.md)

## Quick Links

- [Data Sources Overview](docs/data-sources/00-overview.md)
- [References & Citations](docs/references.md)
- [ADR-0001: Documentation Approach](docs/decisions/0001-documentation-approach.md)

## Related Projects in regards to the Time Machine

- [Venice Time Machine](https://www.timemachine.eu/)
- [Amsterdam Time Machine](https://amsterdamtimemachine.nl/)
