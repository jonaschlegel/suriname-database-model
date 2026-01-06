# Models Directory

This directory contains data models at different levels of abstraction.

## Current Focus: Location Model

We are building **location-first**, starting with historic maps:

1. Digitize and georeference historic maps
2. Annotate features (text, icons, boundaries)
3. Identify what those features represent
4. Link to other data sources

See [location-model.md](./location-model.md) for the complete design with decision rationale.

## Structure

```
models/
├── README.md                 # This file
├── location-model.md         # CURRENT: Location/map model with decisions
├── conceptual/               # High-level entity diagrams
│   └── core-entities.md      # Main entities and relationships
├── logical/                  # Detailed relational models (future)
└── physical/                 # PostgreSQL DDL (future)
```

## Model Progression

```
Source Data → Current State → Conceptual → Logical → Physical
   (CSV)       (as-is ER)    (entities)   (tables)   (SQL DDL)
```

## Documents

| Document                                                     | Status     | Description                           |
| ------------------------------------------------------------ | ---------- | ------------------------------------- |
| [location-model.md](./location-model.md)                     | **Active** | Location schema, decisions, obstacles |
| [conceptual/core-entities.md](./conceptual/core-entities.md) | Reference  | Overview of all entity types          |

## Key Design Decisions (Location)

| Decision           | Choice                            | Rationale                                           |
| ------------------ | --------------------------------- | --------------------------------------------------- |
| Place vs. Feature  | Separate tables                   | Places exist; features are depictions on maps       |
| Hierarchy          | Simple parent + temporal override | Pragmatic; most queries don't need full history     |
| Geometry precision | Nullable + precision_meters       | Don't force false precision                         |
| Coordinates        | Store both canvas and geographic  | Canvas is authoritative; geographic is derived      |
| Names              | Separate table                    | Multiple names per place (historical, multilingual) |

## Open Obstacles

See [location-model.md](./location-model.md#obstacles-and-open-problems) for details:

1. Georeferencing accuracy varies across map regions
2. Temporal boundaries (same place, different shapes over time)
3. Identity matching across sources (is this the same place?)
4. Annotation coordinate transformation pipeline
5. What counts as "the same place" (splits, merges, rebuilds)

---

_Last updated: 2025-01-06_
