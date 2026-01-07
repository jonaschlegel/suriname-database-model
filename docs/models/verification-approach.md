# Verification Approach: Making Sure This Works

> How do we know the database design is right before we build it? This document outlines concrete ways to test our thinking.

---

## The Problem

We have:

- 9 data sources with ~475,000 records
- Complex relationships (people, places, events, interpretations)
- Uncertainty everywhere (dates, names, identities)
- Ethical constraints (can't just "clean" the data)

We've been designing in the abstract. How do we know any of this will actually work?

---

## Verification Strategies

### 1. Competency Questions

Before designing tables, write the questions the database must answer. If we can't answer these with our schema, the design is wrong.

**Person queries:**

- [ ] Who was enslaved at plantation De Hoop in 1830?
- [ ] What do we know about a person named "Jan" who died in Paramaribo in 1850?
- [ ] Show me all records that might refer to the same person (possible duplicates)
- [ ] Who were the parents of child X according to their birth certificate?
- [ ] What was the population of plantation Y over time?

**Place queries:**

- [ ] Where was plantation De Hoop located?
- [ ] How did plantation boundaries change between 1763 and 1861?
- [ ] What places are mentioned in death certificates but not found on any map?
- [ ] Show me all plantations within 10km of Paramaribo

**Source queries:**

- [ ] What sources mention person X?
- [ ] How confident are we about claim Y?
- [ ] Who made interpretation Z and when?
- [ ] Show me the original record for this database entry

**Cross-source queries:**

- [ ] Can we link a person in the slave register to their death certificate?
- [ ] Can we trace someone from birth certificate through slave register to emancipation?
- [ ] Which plantations appear in both the Almanakken and the QGIS maps?

**I should be able to write SQL (or at least pseudo-SQL) for each of these before finalising the schema.**

---

### 2. Trace Real Records Through the Model

Pick 5-10 actual records from each data source. Try to represent them in the proposed schema. See where it breaks.

**Example: Death Certificate #1830/0001**

Source fields:

```
certificate_no: 1830/0001
deceased_name: Jan
deceased_age: 45
deceased_sex: M
death_date: 15-03-1830
death_place: Paramaribo
spouse_1_name: Maria
spouse_1_age: 40
witness_1_name: Piet Jansen
...
```

Questions to answer:

- Where does each field go in my schema?
- How do I create person records for Jan, Maria, and Piet?
- Are they new people or matches to existing records?
- What's the provenance chain?

**Example: Slave Register Entry**

Source fields:

```
Id_person: 12345
Name_enslaved: Kwamina
Sex: M
Age: 25
Plantation: De Hoop
StartEntryYear: 1835
StartEntryEvent: Birth
EndEntryYear: 1850
EndEntryEvent: Death
```

Questions:

- How do I link "De Hoop" to my place table?
- How do I record that "Kwamina" is probably an African name (not enslaver-given)?
- How do I represent the 1835-1850 temporal span?
- If this person also appears in a death certificate, how do I link them?

---

### 3. Build a Minimal Prototype

Don't build the whole database. Build the smallest version that tests the hard parts.

**Prototype scope:**

- 1 plantation (De Hoop)
- 1 map (1763)
- ~50 people from slave registers
- ~20 death certificates
- ~10 birth certificates

**What we're testing:**

- Can we link people across sources?
- Does the interpretation model work?
- Are the certainty levels usable?
- Can we trace provenance?

**Tools:**

- SQLite (simple, no setup)
- Or PostgreSQL with PostGIS (if testing spatial)
- Maybe just a spreadsheet first

---

### 4. Enumerate the Hard Cases

What are the trickiest scenarios? Write them down and make sure the model handles them.

**Identity:**

- Same person, different names in different sources
- Different people, same name
- Person whose identity we're uncertain about
- Person who appears multiple times in same source (slave register temporal entries)

**Places:**

- Place that exists in text but not on map
- Place on map with no readable label
- Place that moved or changed boundaries
- Place with multiple names over time
- Modern place vs. historical place

**Time:**

- Only year known, not month/day
- Approximate date ("circa 1780")
- Conflicting dates in different sources
- Events that span time (enslaved 1830-1850)

**Relationships:**

- Parent-child where only mother is recorded
- Siblings inferred but not stated
- Owner-enslaved relationships
- Witness relationships (what do they mean?)

**For each hard case: can we represent it? How?**

---

### 5. Review with Domain Experts

The design needs external review. Specifically:

**Historical expertise:**

- Does this model make sense for Surinamese history?
- Are we missing important concepts?
- Does the terminology align with the field?

**Database expertise:**

- Are there obvious normalisation problems?
- Will this scale to 500k records?
- Are there performance concerns?

**Ethical review:**

- Does this align with Enslaved.org principles?
- Are we handling sensitive data appropriately?
- Have we consulted with Surinamese stakeholders?

**Who to ask:**

- [ ] Suriname history scholars (van Stipriaan, Oostindie network?)
- [ ] Enslaved.org team
- [ ] GLOBALISE project (they're doing similar work)
- [ ] NiNsee (National Institute Netherlands Slavery Heritage)

---

## Concrete Next Steps

### Immediate (This Week)

1. **Write competency questions**

   - 20-30 questions the database must answer
   - Group by complexity (simple lookup, join, aggregation, uncertain)

2. **Trace 5 real records**
   - 1 death certificate
   - 1 birth certificate
   - 1 slave register entry
   - 1 almanakken entry
   - 1 map feature
   - Write out exactly how each would be stored

### Short Term (Next 2 Weeks)

3. **Build SQLite prototype**

   - Just the core tables
   - Load 50-100 records
   - Try running the competency questions

4. **Document gaps**
   - What couldn't we represent?
   - What felt awkward?
   - What queries were hard to write?

### Medium Term (Next Month)

5. **External review**

   - Share design with 2-3 people
   - Get feedback
   - Revise

6. **Iterate on model**
   - Based on prototype and feedback
   - Update documentation

---

## Success Criteria

How do we know the design is "good enough"?

1. **Representational completeness**: Every field from every source has a home
2. **Query capability**: All competency questions are answerable
3. **Provenance**: Every assertion traces back to source
4. **Uncertainty**: Doubt is explicit, not hidden
5. **Extensibility**: Adding a new source doesn't require schema redesign
6. **Performance**: Queries return in reasonable time (test with prototype)
7. **Expert approval**: At least 2 domain experts say "this makes sense"

---

## Known Risks

Things that might break the design:

1. **Scale**: 475k records is small by database standards, but joins across uncertain matches could explode

2. **Entity resolution**: The "same person?" problem might be harder than we think

3. **Temporal complexity**: Time-varying attributes (plantation ownership, person location) might need more sophisticated modelling

4. **Spatial complexity**: Uncertain geometries, multiple coordinate systems, temporal boundaries

5. **Scope creep**: Adding "just one more" relationship type until the schema is unmanageable

---

## Related Documents

- [Location Model](../models/location-model.md) - Current thinking on places
- [Ethical Framework](../concepts/ethical-framework.md) - Constraints on design
- [Source-to-Model](../concepts/source-to-model.md) - Transformation patterns
- [ADR-0002](../decisions/0002-identifier-strategy.md) - Identifier decisions

---

7 January 2026
