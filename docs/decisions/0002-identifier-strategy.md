# ADR-0002: Unique Identifier Strategy

**Date:** 2026-01-06  
**Status:** Proposed  
**Deciders:** Project team

## Context

We need to assign unique identifiers to entities (persons, plantations, locations, documents) across multiple datasets. The choice of identifier format impacts:

1. **Human readability** - Can researchers understand the ID?
2. **Machine stability** - Does the ID break if names change?
3. **Interoperability** - Can we link to external systems (Wikidata, archives)?
4. **Long-term persistence** - Will IDs remain valid over decades?

From the research board, we evaluated several identifier types:

| Identifier Type         | Format Example                    | Human Readability              | Machine Stability        | Uniqueness            |
| ----------------------- | --------------------------------- | ------------------------------ | ------------------------ | --------------------- |
| Semantic URI            | `.../id/plantation/Peperpot`      | High (clear meaning)           | Low (breaks if renamed)  | Low (depends on name) |
| Opaque URI (Image/Slug) | `https://.../id/plantatie/P_0124` | Medium (short, typeable)       | High (stable prefix)     | High                  |
| Handle (HDL)            | `hdl:10822/VTL43W`                | Low (just numbers)             | High (resolves anywhere) | High                  |
| UUID                    | `550a8400-e29b...`                | Zero (random hex)              | Perfect (unique forever) | Perfect               |
| DOI                     | `10.17026/dans-xyz`               | Medium (recognized "academic") | Medium (landing page)    | High                  |
| ARK                     | `ark:/12345/x9...`                | Medium (technical)             | High (decentralized)     | High                  |

## Decision

We will use a **hybrid identifier strategy**:

### 1. Internal Primary Keys: Auto-increment integers

For database efficiency:

```sql
person_id SERIAL PRIMARY KEY  -- 1, 2, 3, ...
```

### 2. Business Keys: Domain-specific opaque codes

For human reference and cross-system linking:

| Entity       | Format                      | Example      | Notes                           |
| ------------ | --------------------------- | ------------ | ------------------------------- |
| Plantation   | `PSUR####`                  | `PSUR0001`   | Existing from Plantagen Dataset |
| Person       | `PERS_####`                 | `PERS_0001`  | New, sequential                 |
| Location     | `LOC_####`                  | `LOC_0001`   | New, sequential                 |
| Organization | `ORG_####`                  | `ORG_0001`   | New, sequential                 |
| Map          | `MAP_YYYY`                  | `MAP_1763`   | Year-based for historic maps    |
| Vital Record | `BIRTH_####` / `DEATH_####` | `BIRTH_0001` | Type prefix                     |

### 3. External Identifiers: Wikidata Q-IDs

For Linked Open Data interoperability:

```sql
wikidata_id VARCHAR(20)  -- 'Q416086', 'Q3001'
```

### 4. Source Identifiers: Preserve original IDs

For provenance tracking:

```sql
source_row_id VARCHAR(100)  -- 'PSUR0001', 'cert_12345', 'FID_15'
```

## Rationale

### Why not pure UUIDs?

- Ugly and hard to communicate ("look at person 550a8400-e29b...")
- Overkill for a dataset of ~500k records
- No semantic meaning for debugging

### Why not pure Semantic URIs?

- "Semantic drift" - if "Nieuw-Peperpot" becomes "Peperpot", URL breaks
- Hard to handle duplicate names across districts
- Not stable for long-term citation

### Why PSUR-style opaque codes?

- Already established in Plantagen Dataset
- Best balance: Human-readable prefix + stable numeric suffix
- `P_0124` tells you it's a plantation without exposing name
- Easy to type, cite, and remember

### Why also keep Wikidata IDs?

- Links to global knowledge graph
- Enables LOD compatibility
- Free enrichment from Wikidata properties
- Persistent (Wikidata maintains them)

## Consequences

### Positive

- Clear, citable identifiers for publications
- Backwards compatible with existing PSUR IDs
- Can always add Wikidata Q-IDs later
- Source provenance fully preserved

### Negative

- Must maintain mapping between internal IDs and business keys
- Need to mint new IDs for entities not in source data
- Wikidata IDs require manual reconciliation

### Neutral

- Some entities will have 3+ identifiers (internal, business key, Wikidata, source ID)
- Need ID registry/minting service for new entities

## Implementation

### Database Schema Pattern

```sql
CREATE TABLE persons (
    -- Internal key (never exposed externally)
    person_id SERIAL PRIMARY KEY,

    -- Business key (used in APIs, citations)
    person_code VARCHAR(20) UNIQUE NOT NULL,  -- 'PERS_0001'

    -- External linked data
    wikidata_id VARCHAR(20),  -- 'Q416086'

    -- Source provenance
    data_source_id INTEGER REFERENCES data_sources(data_source_id),
    source_table VARCHAR(100),
    source_row_id VARCHAR(100),  -- original ID from source

    -- ... other fields
);
```

### Minting Rules

1. **PSUR IDs**: Use existing IDs from Plantagen Dataset (PSUR0001-PSUR0375)
2. **New plantations**: Continue sequence (PSUR0376, PSUR0377, ...)
3. **Persons**: Sequential from PERS_0001
4. **Locations**: Sequential from LOC_0001

## Alternatives Considered

1. **Pure UUIDs everywhere**

   - Rejected: Too ugly, no semantic meaning

2. **DOIs for all entities**

   - Rejected: Expensive, overkill for internal entities

3. **ARK identifiers**

   - Considered for future: Good for long-term archival, but complex to set up

4. **Hash-based IDs** (e.g., SHA256 of name+date)
   - Rejected: Collision risk, changes if input data corrected

## References

- [@BernersLee2006-linkeddata] - Cool URIs don't change
- [W3C Data on the Web Best Practices](https://www.w3.org/TR/dwbp/)
- Excalidraw board: "the unique identifier - decision" diagram
