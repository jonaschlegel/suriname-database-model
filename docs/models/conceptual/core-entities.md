# Conceptual Model: Core Entities

> This document describes the high-level entities and relationships for the Suriname Time Machine database. It synthesizes concepts from all source datasets into a unified model.

---

## Core Entity Overview

Based on analysis of all 9 data sources, these are the primary entities:

```mermaid
erDiagram
    PERSON {
        string person_code PK "PERS_0001"
        string wikidata_id "Q416086"
        string full_name
        string sex
        int birth_year
        int death_year
    }

    ORGANIZATION {
        string org_code PK "ORG_0001"
        string psur_id UK "PSUR0001"
        string wikidata_id
        string org_type "plantation, military_post"
        string primary_name
    }

    LOCATION {
        string location_code PK "LOC_0001"
        string wikidata_id "Q3001"
        string location_type "settlement, district, river"
        string primary_name
        geometry coordinates
    }

    VITAL_RECORD {
        string record_code PK "BIRTH_0001"
        string record_type "birth, death"
        date certificate_date
        string certificate_place
    }

    MAP {
        string map_code PK "MAP_1763"
        string title
        int year
        geometry extent
    }

    DATA_SOURCE {
        string source_code PK "DS_PLANTAGEN_V1"
        string title
        string version
        int year_from
        int year_to
    }

    PERSON ||--o{ VITAL_RECORD : "appears_in"
    PERSON }o--o{ ORGANIZATION : "associated_with"
    ORGANIZATION }o--|| LOCATION : "located_at"
    MAP ||--o{ LOCATION : "depicts"

    PERSON }o--|| DATA_SOURCE : "sourced_from"
    ORGANIZATION }o--|| DATA_SOURCE : "sourced_from"
    LOCATION }o--|| DATA_SOURCE : "sourced_from"
    VITAL_RECORD }o--|| DATA_SOURCE : "sourced_from"
    MAP }o--|| DATA_SOURCE : "sourced_from"
```

---

## Entity Definitions

### PERSON

Individuals appearing in any dataset - enslaved persons, free persons, witnesses, officials, owners.

**Source datasets:**

- Slave & Emancipation Registers (enslaved individuals)
- Birth Certificates (children, parents, witnesses)
- Death Certificates (deceased, parents, spouses, witnesses)
- Ward Registers (free inhabitants)
- Almanakken (administrators, directors, owners)
- Wikidata (notable historical figures)

### ORGANIZATION

Collective entities - primarily plantations, but also military posts, businesses.

**Source datasets:**

- Plantagen Dataset (plantation master list)
- Almanakken (annual plantation records)
- Slave & Emancipation Registers (plantation references)
- Heritage Guide / 3D Models (buildings)

### LOCATION

Geographic places - settlements, districts, rivers, buildings, plantation sites.

**Source datasets:**

- QGIS Maps (digitized features)
- Ward Registers (streets, neighborhoods)
- Wikidata (coordinates, place hierarchy)
- Heritage Guide (building addresses)

### VITAL_RECORD

Birth and death certificates as documentary evidence.

**Source datasets:**

- Birth Certificates
- Death Certificates

### MAP

Georeferenced historic maps and their features.

**Source datasets:**

- QGIS Maps

### DATA_SOURCE

Metadata about each source dataset for provenance tracking.

**Implementation:** Already defined in data-sources documentation.

---

## Relationship Types

### Person-Organization Relationships

```mermaid
erDiagram
    PERSON ||--o{ PERSON_ORGANIZATION : "has_role"
    ORGANIZATION ||--o{ PERSON_ORGANIZATION : "employs"

    PERSON_ORGANIZATION {
        int person_id FK
        int organization_id FK
        string role "owner, director, administrator, enslaved, contract_laborer"
        int year_from
        int year_to
        int data_source_id FK
    }
```

**Roles identified from sources:**
| Role | Source Dataset | Description |
|------|----------------|-------------|
| `owner` | Almanakken | Plantation owner (eigenaar) |
| `director` | Almanakken | Plantation director (directeur) |
| `administrator` | Almanakken | Administrator (administrateur) |
| `enslaved` | Slave & Emancipation | Enslaved person on plantation |
| `contract_laborer` | Post-1863 records | Contract worker |

### Person-Vital Record Relationships

```mermaid
erDiagram
    PERSON ||--o{ VITAL_RECORD_PERSON : "appears_as"
    VITAL_RECORD ||--o{ VITAL_RECORD_PERSON : "mentions"

    VITAL_RECORD_PERSON {
        int person_id FK
        int vital_record_id FK
        string role "child, mother, father, deceased, informant, witness_1, witness_2, spouse"
        int age_at_event
        string occupation
    }
```

**Roles on vital records:**
| Role | Birth Cert | Death Cert |
|------|-----------|------------|
| `child` | Yes | - |
| `mother` | Yes | - |
| `father` | Yes | - |
| `deceased` | - | Yes |
| `informant` | Yes | Yes |
| `witness_1` | Yes | Yes |
| `witness_2` | Yes | Yes |
| `spouse` | - | Yes (up to 4) |
| `parent_1` | - | Yes |
| `parent_2` | - | Yes |

### Organization-Location Relationships

```mermaid
erDiagram
    ORGANIZATION ||--o{ ORG_LOCATION : "operates_at"
    LOCATION ||--o{ ORG_LOCATION : "hosts"

    ORG_LOCATION {
        int organization_id FK
        int location_id FK
        string relationship_type "primary_site, boundary"
        int year_from
        int year_to
        string certainty "high, medium, low"
    }
```

### Temporal Aspects

Many relationships have temporal validity:

```mermaid
flowchart LR
    subgraph TEMPORAL["Temporal Patterns"]
        POINT["Point in time<br>(birth_date, death_date)"]
        RANGE["Date range<br>(year_from - year_to)"]
        SERIES["Series data<br>(Serie1, Serie2, ...)"]
    end
```

---

## Entity Count Estimates

| Entity       | Estimated Records  | Primary Source                             |
| ------------ | ------------------ | ------------------------------------------ |
| PERSON       | ~150,000 - 300,000 | All person datasets combined, deduplicated |
| ORGANIZATION | ~500 - 1,000       | Plantagen + Almanakken unique              |
| LOCATION     | ~1,000 - 5,000     | QGIS + Ward Register streets + Wikidata    |
| VITAL_RECORD | ~255,000           | Birth (63k) + Death (192k)                 |
| MAP          | ~10 - 20           | QGIS georeferenced maps                    |
| DATA_SOURCE  | 9                  | One per dataset                            |

---

## Cross-Dataset Linking Strategy

### How entities connect across sources:

```mermaid
flowchart TB
    subgraph PERSON_LINKING["Person Linking"]
        SE[Slave & Emancipation<br>Id_person]
        BC[Birth Certificates<br>name + birth_date]
        DC[Death Certificates<br>name + death_date]
        WR[Ward Registers<br>name + address + year]
        WD[Wikidata<br>Q-ID]
    end

    SE -.->|name matching| BC
    BC -.->|same person| DC
    WR -.->|address + name| BC
    WD -.->|manual reconciliation| SE

    subgraph ORG_LINKING["Organization Linking"]
        PD[Plantagen Dataset<br>PSUR_ID]
        AL[Almanakken<br>psur_id]
        SEORG[Slave & Emancipation<br>Plantation name]
        QGIS[QGIS Maps<br>feature name]
    end

    PD -->|primary key| AL
    PD -.->|name matching| SEORG
    PD -.->|name + location| QGIS
```

---

## Open Questions

### Person Identity Resolution

- [ ] How to handle name variations (spelling, transliteration)?
- [ ] What confidence threshold for automated matching?
- [ ] How to represent uncertain identity links?

### Temporal Precision

- [ ] How to handle dates with only year known?
- [ ] How to represent "floruit" (active period) for persons?
- [ ] What granularity for Series 1-4 in Plantagen Dataset?

### Geographic Resolution

- [ ] How to link historic districts to modern boundaries?
- [ ] What coordinate accuracy is achievable from historic maps?
- [ ] How to handle location name changes over time?

---

## Next Steps

1. Create logical model with full attribute lists
2. Define junction tables for M:N relationships
3. Establish normalization level (target: 3NF with controlled denormalization)
4. Design provenance tracking columns

---

7 January 2026
