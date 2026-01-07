# Testing Strategy

How do we know the data is good and the model makes sense?

---

## Levels

| level | question | method |
|-------|----------|--------|
| schema | can we represent the data? | trace examples |
| query | can we answer research questions? | competency questions |
| quality | is the data internally consistent? | constraint checks |
| provenance | is every claim grounded in sources? | audit trail |
| semantic | does it make sense to domain experts? | review |

---

## Schema validation

Trace examples: for each source type, walk a real record through the model.

Document:
- where each field goes
- what entities created
- what relationships established
- what breaks or feels awkward

Current coverage:

| source | example | status |
|--------|---------|--------|
| death cert | Kwamina 1850 | done |
| slave register | Kwamina De Hoop | done |
| map feature | De Hoop polygon | done |
| cross-source | Kwamina across sources | done |
| birth cert | Example 5 | done |
| almanakken | Example 6 | done |

See trace-examples.md

Field coverage matrix: for each source, verify every field has a home. If field has nowhere to go, schema incomplete.

---

## Query validation

Competency questions: the database must answer specific research questions.

For each:
1. write SQL (or pseudo-SQL)
2. verify required tables/columns exist
3. estimate query complexity
4. test with sample data

Priority questions:

| id | question | why priority |
|----|----------|--------------|
| P01 | all names for person | core functionality |
| P03 | people in multiple sources | cross-source linking |
| P16 | all enslaved people | primary research question |
| L12 | all people at plantation X | place-person relationship |
| X01 | death certs matching slave register | entity resolution |
| X07 | timeline from all sources | full integration test |

See competency-questions.md

Query complexity targets:
- simple lookup: 1-2 joins
- cross-source: 3-4 joins
- timeline reconstruction: recursive CTE or application logic

If queries too complex, consider denormalisation or views.

---

## Data quality checks

Referential integrity:
- every person_id references valid person
- every place_id references valid place
- every source_id references valid source

Domain constraints:
- sex in (M, F, U)
- date between 1700-01-01 and 1950-12-31
- certainty in (definite, probable, possible, uncertain)
- age between 0 and 120

Temporal consistency:
- death_date >= birth_date
- end_date >= start_date
- observation_date within source date range

Quality reports:
- missing required fields
- dates outside expected range
- potential duplicates
- orphan records
- impossible ages

---

## Provenance validation

Following PICO model, every assertion needs:

| element | stored where | example |
|---------|--------------|---------|
| source document | source.id | death cert 1850/0042 |
| what source says | person_observation | Name: Kwamina, Age: 45 |
| interpretation | person_reconstruction | this is person P5001 |
| who interpreted | interpretation.made_by | jschlegel |
| when | interpretation.made_at | 2026-01-07 |
| confidence | interpretation.certainty | probable |

Audit trail test: for any fact, answer:
1. what source document says this?
2. who transcribed?
3. who interpreted?
4. when?
5. how confident?

Procedure: pick 10 random facts, trace each to source. If any link missing, provenance model broken.

---

## Semantic validation

Domain expert review:
- terminology matches Surinamese historiography?
- categories historically appropriate?
- relationship types make sense?
- missing important concepts?

HDSC alignment:
- can they recognise our data patterns?
- does structure map to Ward Registers LOD?
- can we export to RDF that validates against PICO shapes?

Ethical review (per Enslaved.org):
- centring enslaved people as historical actors?
- preserving violence of record while adding context?
- avoiding dehumanising language?

---

## Milestones

1. paper validation (now)
   - complete trace examples
   - resolve "must solve" issues
   - write pseudo-SQL for priority questions
   - document schema gaps

2. sample data test
   - load 50-100 records per source type
   - run competency questions
   - generate quality report
   - test provenance trace

3. cross-source integration
   - link people across sources
   - test person_match workflow
   - verify timeline reconstruction
   - measure entity resolution accuracy

4. export validation
   - export sample as JSON-LD
   - validate against PICO shapes
   - review with HDSC
   - iterate

---

## Open questions

- how many joins too many? test with sample data
- does separate-with-links scale with thousands of potential matches?
- is certainty useful? do researchers use it or ignore it?
- what breaks first?

---

## Related

- trace-examples.md
- competency-questions.md
- verification-approach.md
- decisions/0003-pico-terminology.md

---

7 January 2026
