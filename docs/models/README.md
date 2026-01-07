# Models Directory

This directory contains data models at different levels of abstraction.

## Current Focus: Location Model

We are building **location-first**, starting with historic maps:

1. Digitize and georeference historic maps
2. Annotate features (text, icons, boundaries)
3. Identify what those features represent
4. Link to other data sources

See [location-model.md](./location-model.md) for the complete design with decision rationale.

## Verification

Before building, we need to verify the design works:

- [verification-approach.md](./verification-approach.md) - Overall verification strategy
- [testing-strategy.md](./testing-strategy.md) - Multi-level testing plan
- [competency-questions.md](./competency-questions.md) - Questions the database must answer
- [trace-examples.md](./trace-examples.md) - Real records traced through the model (6 examples)

**Current status:** Design phase. Testing with trace examples, identifying schema gaps.

## Structure

```
models/
├── README.md                 # This file
├── location-model.md         # CURRENT: Location/map model with decisions
├── verification-approach.md  # How we verify the design
├── testing-strategy.md       # Multi-level testing approach
├── competency-questions.md   # Test questions for the schema
├── trace-examples.md         # Real data walked through model
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
| [verification-approach.md](./verification-approach.md)       | **Active** | Overall verification strategy         |
| [testing-strategy.md](./testing-strategy.md)                 | **Active** | Multi-level testing plan              |
| [competency-questions.md](./competency-questions.md)         | **Active** | 60+ test questions                    |
| [trace-examples.md](./trace-examples.md)                     | **Active** | 6 source type examples                |
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

7 January 2026
