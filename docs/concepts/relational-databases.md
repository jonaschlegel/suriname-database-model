# Relational Databases: Notes

> Background reading and thinking about why relational databases, what the theory says, and where the theory doesn't quite fit our situation.

---

## Why a Relational Database?

I considered alternatives:

- **Document store (MongoDB)** - Flexible schema, good for heterogeneous data
- **Graph database (Neo4j)** - Natural for relationships, which we have lots of
- **Triple store (Blazegraph)** - Native RDF, good for linked data

But I keep coming back to PostgreSQL because:

1. **PostGIS** - We need spatial queries, and PostGIS is excellent
2. **Maturity** - Decades of tooling, documentation, community
3. **Flexibility** - Can add JSON columns where needed
4. **I know it** - Honestly, this matters

**Worry:** Am I choosing PostgreSQL because it's the right tool, or because it's the tool I know?

**Counter-argument:** The Venice Time Machine uses PostgreSQL. The Amsterdam Time Machine uses PostgreSQL. If it's good enough for them, it's probably good enough for me.

---

## The Basics (for my own reference)

### Tables and Keys

A table is a set of rows. Each row has the same columns. A primary key uniquely identifies each row.

```
person
+----+--------+------------+
| id | name   | birth_year |
+----+--------+------------+
|  1 | Jan    | 1780       |
|  2 | Maria  | NULL       |
+----+--------+------------+
```

Foreign keys link tables together. If `person_event.person_id` references `person.id`, the database enforces that you can't create an event for a person that doesn't exist.

### Surrogate vs Natural Keys

A **natural key** is something meaningful from the real world: an archive reference number, a registration code.

A **surrogate key** is something the database generates: usually an auto-incrementing integer.

We're using surrogates as primary keys because:

- Archive references change or have errors
- Some records don't have natural identifiers
- Integers are efficient for joins

But we keep natural keys as separate columns for traceability. See [ADR-0002](../decisions/adr-0002-identifier-strategy.md).

---

## Normalisation

The textbook says: normalise to avoid redundancy and update anomalies.

### First Normal Form (1NF)

No repeating groups. Each cell contains one value.

Bad:

```
| person | children    |
| Jan    | Piet, Klaas |
```

Good:

```
| person | child |
| Jan    | Piet  |
| Jan    | Klaas |
```

### Second Normal Form (2NF)

Every non-key column depends on the whole primary key, not just part of it.

This mostly matters for composite keys. If my key is `(person_id, date)` and I have a column `person_name`, that's wrong because `person_name` only depends on `person_id`.

### Third Normal Form (3NF)

No transitive dependencies. Column A shouldn't depend on column B which depends on the key.

Bad:

```
| person_id | plantation_id | plantation_name |
```

`plantation_name` depends on `plantation_id`, not directly on `person_id`. Should be a separate table.

### But...

The historical sources don't care about normal forms. A death certificate has the deceased's name, their spouse's name, their parents' names, and four witness names, all on one line.

I could normalise strictly:

- `death_certificate` table
- `person` table
- `death_certificate_person` junction table with role field

Or I could keep a flatter structure that mirrors the source:

- `death_certificate` table with `deceased_name`, `spouse_1_name`, etc.

The first approach is "correct" but loses the structure of the original document. The second preserves provenance but has redundancy.

**Current thinking:** Normalise for the integrated data, but keep source-faithful extracts as separate views or tables. That way I can always see what the original looked like.

---

## The Date Problem

Historical records have incomplete dates.

"Jan was born in 1780" - we know the year
"Maria was born in the early 19th century" - we know roughly
"Piet was born" - we know he existed but not when

PostgreSQL's DATE type wants a full date: YYYY-MM-DD.

Options:

**Option A: Separate year/month/day columns**

```sql
birth_year INTEGER,
birth_month INTEGER,  -- NULL if unknown
birth_day INTEGER     -- NULL if unknown
```

Problem: Awkward to query. "People born before 1800" becomes complex.

**Option B: Date with precision field**

```sql
birth_date DATE,
birth_date_precision VARCHAR(10)  -- 'year', 'month', 'day', 'circa'
```

Problem: What do I put in `birth_date` if I only know the year? 1780-01-01? That implies January 1st.

**Option C: Date range**

```sql
birth_date_earliest DATE,
birth_date_latest DATE
```

Problem: Most dates would have earliest = latest. Lots of redundancy.

**Option D: ISO 8601 extended**
Store as text: "1780" or "1780-05" or "1780-05-15"
Problem: Can't do date arithmetic. Queries are string comparisons.

I've been going with **Option B** but I'm not happy with it. The "fake" date value bothers me.

**Reference:** There's a standard for uncertain dates called EDTF (Extended Date/Time Format). Maybe I should use that? See: https://www.loc.gov/standards/datetime/

---

## Spatial Data and PostGIS

PostGIS adds geometry types to PostgreSQL. I can store points, lines, polygons, and query them spatially.

```sql
CREATE TABLE place (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geometry GEOMETRY(GEOMETRY, 4326)
);

-- Find places within 10km of Paramaribo
SELECT * FROM place
WHERE ST_DWithin(
    geometry,
    ST_MakePoint(-55.2038, 5.8520)::geography,
    10000
);
```

The `4326` is the coordinate system (WGS84, same as GPS). PostGIS handles the maths of distances on a sphere.

**Complication:** My historic maps aren't in WGS84 originally. The georeferencing process transforms them, but introduces error. See the [location model](../models/location-model.md) for more on this.

---

## JSON Columns

PostgreSQL has JSONB columns for semi-structured data. Useful when:

- Schema varies between records
- Storing nested data from an API
- Migrating from a document store

I'm using JSONB for:

- Original source data (before parsing)
- W3C annotation bodies (complex nested structure)
- Metadata I haven't fully modelled yet

```sql
CREATE TABLE web_annotation (
    id SERIAL PRIMARY KEY,
    body_json JSONB NOT NULL
);

-- Query inside the JSON
SELECT * FROM web_annotation
WHERE body_json @> '{"purpose": "transcribing"}';
```

**Risk:** JSONB is easy to abuse. If I put everything in JSON, I lose the benefits of relational modelling. Using it as a escape hatch when I'm too lazy to design proper tables.

**Rule for myself:** JSONB for truly semi-structured data (API responses) or temporary storage. Not for core entities.

---

## Indexes

Indexes speed up queries but slow down writes and use storage. Rules of thumb:

- Primary keys are indexed automatically
- Foreign keys should be indexed (not automatic in PostgreSQL!)
- Columns in WHERE clauses benefit from indexes
- Columns in ORDER BY benefit from indexes

For spatial data:

```sql
CREATE INDEX idx_place_geom ON place USING GIST (geometry);
```

GIST indexes are special tree structures for spatial and other complex data.

For text search:

```sql
CREATE INDEX idx_person_name ON person_name USING GIN (to_tsvector('dutch', name));
```

GIN indexes support full-text search. The 'dutch' configuration handles Dutch language stemming and stop words.

**To investigate:** What about fuzzy matching for historical name variants? Maybe trigram indexes?

```sql
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_name_trgm ON person_name USING GIN (name gin_trgm_ops);

-- Find similar names
SELECT * FROM person_name
WHERE name % 'De Hoop'  -- similarity match
ORDER BY similarity(name, 'De Hoop') DESC;
```

Haven't tested this yet.

---

## Things I Don't Fully Understand

1. **Transaction isolation levels** - I know they exist, I use the defaults, I should probably understand them better.

2. **Query planning** - PostgreSQL has an EXPLAIN command. I've used it but don't really know how to interpret the output.

3. **Partitioning** - For very large tables, you can split them across physical storage. Probably not needed for our scale?

4. **Replication** - For high availability. Not a priority now, but might matter later.

---

## References

### Database Fundamentals

**Date, C.J.** _An Introduction to Database Systems_. 8th ed. Boston: Addison-Wesley, 2003.
The classic textbook. Dense but thorough. Good on theory, less on practical implementation.

**Kleppmann, Martin.** _Designing Data-Intensive Applications_. Sebastopol, CA: O'Reilly, 2017.
Good overview of database concepts and trade-offs. Not PostgreSQL-specific but very practical. The chapters on data models and encoding are excellent.

### PostgreSQL and PostGIS

**PostgreSQL Documentation** - https://www.postgresql.org/docs/current/
Very good reference. The tutorial sections are accessible. I keep the JSON functions page open constantly.

**PostGIS Documentation** - https://postgis.net/documentation/
Essential for spatial work. The "Introduction to PostGIS" workshop materials are a good starting point.

**Obe, Regina O., and Leo S. Hsu.** _PostGIS in Action_. 3rd ed. Shelter Island, NY: Manning, 2021.
Practical cookbook. Has chapters on raster data and 3D which might be relevant for maps.

### Historical Data Specifically

**Gregory, Ian N., and Paul S. Ell.** _Historical GIS: Technologies, Methodologies and Scholarship_. Cambridge: Cambridge University Press, 2007.
The standard introduction to historical GIS. Chapter 5 on data quality and uncertainty is directly relevant to our date and certainty problems.

**Harvey, Charles, and Jon Press.** _Databases in Historical Research: Theory, Methods, and Applications_. Basingstoke: Macmillan, 1996.
Older but still useful. Written before current tools but the conceptual issues remain.

### On Dates and Uncertainty

**Library of Congress.** "Extended Date/Time Format (EDTF)." https://www.loc.gov/standards/datetime/
The standard for uncertain and approximate dates. Worth implementing properly.

**Grossner, Karl, and Rainer Simon.** "Linked Places: A Modeling Pattern and Software for Representing Historical Movement." In _Proceedings of the Workshop on Linked Data on the Web_. 2017.
On representing temporal uncertainty in linked data. Relevant even if we stay in PostgreSQL.

See also the full [references document](./references.md) for more on data modelling and historical databases.

---

7 January 2026
