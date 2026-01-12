# Suriname Time Machine Database Model

## Dataset Data Sources

| Dataset                                                                      | Records             | Period          | Primary Entity                             |
| ---------------------------------------------------------------------------- | ------------------- | --------------- | ------------------------------------------ |
| [Plantagen Dataset](docs/data-sources/01-plantagen-dataset.md)               | 375                 | 1700–1863       | Plantations                                |
| [Death Certificates](docs/data-sources/02-death-certificates.md)             | 192,335             | 1845–1915       | Vital records                              |
| [Birth Certificates](docs/data-sources/03-birth-certificates.md)             | 63,200              | 1828–1921       | Vital records                              |
| [Ward Registers](docs/data-sources/04-ward-registers.md)                     | 102,260             | 1828–1847       | Census data                                |
| [Slave & Emancipation](docs/data-sources/05-slave-emancipation.md)           | 95,388              | 1830–1863       | Enslaved persons                           |
| [Almanakken](docs/data-sources/06-almanakken.md)                             | 22,000              | 1819–1935       | Plantation records                         |
| [QGIS Maps](docs/data-sources/07-qgis-maps.md)                               | ~300                | 1763–1861       | Geographic features                        |
| [Wikidata](docs/data-sources/08-wikidata.md)                                 | —                   | —               | External references                        |
| [Historic Map Annotations](docs/data-sources/10-historic-map-annotations.md) | not yet deterimined | everything maps | HTR and AI recognised annotationns on Maps |

**Total:** ~475,000+ records across 10 data sources

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
