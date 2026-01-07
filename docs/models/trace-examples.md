# Trace Example: Testing the Model with Real Data

> Walking through real records to see if the proposed model can represent them.

---

## Purpose

Take actual records from our sources and trace exactly how they would be stored. This surfaces problems that abstract thinking misses.

---

## Example 1: Death Certificate

### Source Record

From death certificates dataset, a fictional but realistic example:

```
certificate_no: 1850/0042
deceased_name: Kwamina
deceased_age: 45
deceased_sex: M
death_date: 15-03-1850
death_place: Paramaribo
occupation: Timmerman (carpenter)
spouse_1_name: Maria
spouse_1_age: 40
witness_1_name: Jan Pieters
witness_1_age: 35
witness_1_occ: Ambtenaar (official)
witness_2_name: Hendrik Jansen
witness_2_age: 42
witness_2_occ: Koopman (merchant)
original_scanid: 12345
inventory_number: 789
```

### Proposed Storage

**Table: source_document**

```sql
INSERT INTO source_document (id, source_type, reference_number, archive_ref, scan_id)
VALUES (1001, 'death_certificate', '1850/0042', 'NAS-789', 12345);
```

**Table: person** (create 4 persons)

```sql
-- The deceased
INSERT INTO person (id, psur_code) VALUES (5001, 'PERS_5001');

-- Spouse
INSERT INTO person (id, psur_code) VALUES (5002, 'PERS_5002');

-- Witnesses
INSERT INTO person (id, psur_code) VALUES (5003, 'PERS_5003');
INSERT INTO person (id, psur_code) VALUES (5004, 'PERS_5004');
```

**Table: person_name**

```sql
INSERT INTO person_name (person_id, name_value, name_type, source_id)
VALUES
  (5001, 'Kwamina', 'recorded', 1001),
  (5002, 'Maria', 'recorded', 1001),
  (5003, 'Jan Pieters', 'recorded', 1001),
  (5004, 'Hendrik Jansen', 'recorded', 1001);
```

**Table: death_event** (or event with type?)

```sql
INSERT INTO event (id, event_type, event_date, event_date_precision, place_id)
VALUES (7001, 'death', '1850-03-15', 'day', ?); -- place_id for Paramaribo
```

**Table: event_person** (link person to event with role)

```sql
INSERT INTO event_person (event_id, person_id, role, age_at_event)
VALUES
  (7001, 5001, 'deceased', 45),
  (5001, 5002, 'spouse', 40),
  (7001, 5003, 'witness', 35),
  (7001, 5004, 'witness', 42);
```

### Issues Identified

1. **Place linking**: "Paramaribo" in the certificate - do I create a place record? Link to existing? What if spelling varies?

2. **Name type**: "Kwamina" is probably an Akan day-name (born on Saturday). Should `name_type` be 'african_origin' rather than 'recorded'? But how do I know this from the source alone?

3. **Occupation storage**: Where does "Timmerman" go? On the person? On the event? It's the occupation at time of death.

4. **Relationship certainty**: The certificate says Maria is spouse. Is that definite or just what the informant claimed?

5. **Duplicate detection**: If Kwamina also appears in slave registers, how do we link? Name matching is unreliable.

---

## Example 2: Slave Register Entry

### Source Record

From slave registers dataset:

```
Id_person: 8472
Name_enslaved: Kwamina
Sex: M
Age: 25
Plantation: De Hoop
Name_owner: J. van der Berg
StartEntryYear: 1830
StartEntryEvent: Start Series
EndEntryYear: 1850
EndEntryEvent: Death
Name_mother: Adjua
Inventory_number: 456
Folio_number: 23
```

### Proposed Storage

**Table: source_document**

```sql
INSERT INTO source_document (id, source_type, archive_ref, folio)
VALUES (2001, 'slave_register', 'NAS-456', 23);
```

**Table: person** (reuse if same person, else new)

```sql
-- Is this the same Kwamina as in death certificate?
-- Uncertain. Create new, link later.
INSERT INTO person (id, psur_code) VALUES (5001, 'PERS_5001'); -- or 5005 if new
```

**Table: person_name**

```sql
INSERT INTO person_name (person_id, name_value, name_type, source_id)
VALUES (5001, 'Kwamina', 'enslaver_context', 2001);
```

**Table: organisation** (the plantation)

```sql
-- Assume plantation already exists
-- De Hoop has id 301
```

**Table: organisation_person** (enslavement relationship)

```sql
INSERT INTO organisation_person (
  organisation_id, person_id, relationship_type,
  start_date, end_date, source_id
)
VALUES (301, 5001, 'enslaved_at', '1830-01-01', '1850-12-31', 2001);
```

**Table: person** (mother)

```sql
INSERT INTO person (id, psur_code) VALUES (5006, 'PERS_5006');
INSERT INTO person_name (person_id, name_value, name_type, source_id)
VALUES (5006, 'Adjua', 'enslaver_context', 2001);
```

**Table: person_relationship**

```sql
INSERT INTO person_relationship (person_id, related_person_id, relationship_type, source_id)
VALUES (5001, 5006, 'mother', 2001);
```

### Issues Identified

1. **Temporal precision**: Register gives year only. I'm storing '1830-01-01' which implies Jan 1. Should be '1830' with precision 'year'.

2. **Owner vs. Plantation**: Record has both `Plantation: De Hoop` and `Name_owner: J. van der Berg`. These are different entities. Need organisation (plantation) and person (owner) with ownership relationship.

3. **Multiple entries**: The dataset note says "Multiple entries per person based on Start and End Entry information." So this person might have another row for a different time period. How do I handle that? Is it one person with multiple organisation_person records?

4. **Cross-source identity**: Is this Kwamina the same as death certificate Kwamina? Both die around 1850, both male, both have African-origin names. Likely same person but not certain.

5. **Mother's identity**: "Adjua" is recorded only as mother's name. She might have her own slave register entry. Should I link? With what certainty?

---

## Example 3: Map Feature

### Source: Polygon traced from 1763 map

```
feature_id: F_1763_042
map_id: MAP_1763_001
geometry: POLYGON((...coordinates...))
label_text: "de Hoop"
feature_type: plantation
canvas_uri: https://iiif.example.org/map/1763/canvas/1
annotation_uri: https://annorepo.example.org/anno/abc123
```

### Proposed Storage

**Table: map**

```sql
INSERT INTO map (id, title, date, iiif_manifest, archive_ref)
VALUES (101, 'Kaart van Suriname 1763', '1763-01-01', 'https://...', 'NA-4.VEL-xxx');
```

**Table: map_feature**

```sql
INSERT INTO map_feature (
  id, map_id, geometry, label_text, feature_type, annotation_uri
)
VALUES (
  1042, 101, ST_GeomFromText('POLYGON(...)'), 'de Hoop', 'plantation', 'https://...'
);
```

**Table: place** (the abstract place)

```sql
-- De Hoop plantation
INSERT INTO place (id, psur_code, place_type)
VALUES (301, 'LOC_0042', 'plantation');
```

**Table: place_name**

```sql
INSERT INTO place_name (place_id, name_value, source_id)
VALUES (301, 'De Hoop', 2001); -- from slave register
INSERT INTO place_name (place_id, name_value, source_id)
VALUES (301, 'de Hoop', 101);  -- from map (different capitalisation)
```

**Table: interpretation** (link feature to place)

```sql
INSERT INTO interpretation (
  id, map_feature_id, place_id, certainty, reasoning, made_by, made_at
)
VALUES (
  9001, 1042, 301, 'probable',
  'Label matches known plantation name, location consistent with other maps',
  'jschlegel', '2025-01-06'
);
```

### Issues Identified

1. **Geometry precision**: The polygon looks exact but isn't. The 1763 map has unknown projection, my georeferencing has error. Should store uncertainty somehow.

2. **Name variations**: "de Hoop" vs "De Hoop" vs "D'Hoop". Are these same name with different spellings, or should I normalise?

3. **Temporal validity**: This geometry is valid for 1763. If I trace the same plantation on an 1861 map, it might have different boundaries. Need `valid_from` / `valid_to` on something.

4. **Feature vs. Place**: The feature (polygon on canvas) and place (abstract plantation) are correctly separated. But the geometry is on feature, not place. If someone queries "where is De Hoop?" they need to go through interpretation to get geometry. Is that right?

5. **Multiple maps**: De Hoop appears on 1763, 1830, and 1861 maps. That's 3 features, 1 place, 3 interpretations. Correct? Or should interpretations group features?

---

## Example 4: Linking Across Sources

### The Hard Part

We have:

- Death certificate: Kwamina, M, died 1850, age 45, Paramaribo
- Slave register: Kwamina, M, died 1850, De Hoop plantation, age 25 in 1830 (so ~45 in 1850)
- Map feature: "de Hoop" polygon on 1763 map

These are probably all connected. How do we represent that?

### Proposed Linking

**Person identity:**

```sql
-- Create a "possible match" record
INSERT INTO person_match (
  person_id_1, person_id_2, match_type, certainty, reasoning, made_by
)
VALUES (
  5001, -- death cert Kwamina
  5001, -- slave reg Kwamina (if same id) or 5007 if separate
  'same_person', 'probable',
  'Same name, sex, death year; ages consistent',
  'jschlegel'
);
```

Wait, if I think they're the same person, should I use the same person_id from the start? Or create separate and link?

**Option A**: Same person_id, multiple person_name records

- Pro: Queries are simpler
- Con: If I'm wrong, hard to undo

**Option B**: Separate person_ids, explicit match record

- Pro: Preserves uncertainty
- Con: Every "find this person" query needs to handle possible matches

I think Option B is right for this project. The uncertainty is real.

**Place identity:**

The slave register says "Plantation: De Hoop". The map has a feature labelled "de Hoop". These should link to the same place record.

```sql
-- Both source extractions point to place 301
-- Slave register: organisation_person.organisation_id = 301
-- Map: interpretation.place_id = 301
```

This works if I do the linking correctly during import. But what if the slave register says "De Hoop" and I haven't traced that plantation on the map yet? I need to create a place record from the text alone, then link the map feature later.

---

## Summary of Issues Found

### PICO Model Relevance

After analysing the PICO model (see [pico-model.md](../concepts/pico-model.md)), several issues below have established solutions:

**Issue #3 (Person identity)**: PICO uses PersonObservation (raw from source) vs PersonReconstruction (derived identity). This is explicitly the "separate-with-links" approach. Each source creates a PersonObservation; linking them creates a PersonReconstruction. The PROV-O vocabulary (`prov:wasDerivedFrom`) tracks derivation.

**Issue #2 (Name normalisation)**: PICO uses the Person Name Vocabulary (PNV) which handles Dutch naming conventions (prefix, patronym, base surname). We may need extensions for Surinamese patterns (single names, African day-names).

**Issue #10 (Occupation)**: PICO puts `hasOccupation` on PersonObservation, not on person or event. This is correct: occupation is what the source says at that moment.

The Ward Registers LOD version at DataLegend shows PICO extended for enslaved people with `hdsc:isEnslavedOf` and `hdsc:isEnslaverBy` properties.

### Must Solve Before Building

1. **Temporal precision on dates**: Need a clear pattern for year-only, month-only, approximate dates.

2. **Name normalisation**: Decide on approach for spelling variants. Store all variants? Have a canonical form?

3. **Person identity strategy**: Same ID vs. separate-with-links. Leaning toward separate-with-links.

4. **Geometry temporal validity**: Features need valid_from/valid_to or link to source date.

### Open Questions

5. **Occupation storage**: On person, on event, or on source_assertion?

6. **Certainty of source assertions**: The certificate says Maria is spouse. Is that "definite" or should all source assertions carry uncertainty?

7. **Mother linking in slave registers**: Create mother as person, but how confident is the link?

### Schema Gaps Identified

8. **No person_match table** in current thinking. Need to add.

9. **No organisation_person for owner** vs. **enslaved_at**. Need relationship_type distinction.

10. **No occupation table**. Might want controlled vocabulary.

---

## Next Steps

1. Resolve the "Must Solve" issues with explicit decisions
2. Update schema documentation
3. Build SQLite prototype with these examples
4. Test competency questions against prototype

---

## Example 5: Birth Certificate

### Source Record

From birth certificates dataset, a fictional but realistic example:

```
id: 4521
cert_date: 12-05-1855
cert_place: Paramaribo
birth_date: 10-05-1855
birth_daypart: morning
birth_hour: 8
birth_place: Gravenstraat 42

child_sex: F
child_fname: Wilhelmina
child_prefix: van
child_sname: Berg

moth_fname: Carolina
moth_prefix: van
moth_sname: Berg
moth_occ: washerwoman
moth_place: Gravenstraat 42

fath_fname: [empty]
fath_prefix: [empty]
fath_sname: [empty]

inf_fname: Carolina
inf_prefix: van
inf_sname: Berg
inf_age: 28
inf_occ: washerwoman
inf_place: Gravenstraat 42
inf_sig: unable to sign
inf_pres: yes

wts_fname_1: Johannes
wts_sname_1: Bakker
wts_age_1: 45
wts_occ_1: clerk
wts_place_1: Keizerstraat

wts_fname_2: Pieter
wts_sname_2: de Vries
wts_age_2: 38
wts_occ_2: shopkeeper
wts_place_2: Domineestraat

original_scanid: 67890
inventory_number: 234
folio: 15
```

### Proposed Storage

**Table: source (the archival document)**

```sql
INSERT INTO source (id, source_type, reference_number, archive_ref, scan_id, folio)
VALUES (3001, 'birth_certificate', '1855/4521', 'NAS-234', 67890, 15);
```

**Table: person_observation (6 observations from this source)**

```sql
-- Child
INSERT INTO person_observation (id, source_id, given_name, prefix, surname, sex)
VALUES (obs_1001, 3001, 'Wilhelmina', 'van', 'Berg', 'F');

-- Mother (also informant)
INSERT INTO person_observation (id, source_id, given_name, prefix, surname, sex, age, occupation, address)
VALUES (obs_1002, 3001, 'Carolina', 'van', 'Berg', 'F', 28, 'washerwoman', 'Gravenstraat 42');

-- Witnesses
INSERT INTO person_observation (id, source_id, given_name, surname, age, occupation, address)
VALUES (obs_1003, 3001, 'Johannes', 'Bakker', 45, 'clerk', 'Keizerstraat');

INSERT INTO person_observation (id, source_id, given_name, surname, age, occupation, address)
VALUES (obs_1004, 3001, 'Pieter', 'de Vries', 38, 'shopkeeper', 'Domineestraat');
```

**Table: event (the birth)**

```sql
INSERT INTO event (id, event_type, event_date, event_time, place_text, source_id)
VALUES (evt_2001, 'birth', '1855-05-10', '08:00', 'Gravenstraat 42', 3001);
```

**Table: event_role (link observations to event)**

```sql
INSERT INTO event_role (event_id, person_observation_id, role)
VALUES
  (evt_2001, obs_1001, 'child'),
  (evt_2001, obs_1002, 'mother'),
  (evt_2001, obs_1002, 'informant'),  -- Same person, two roles
  (evt_2001, obs_1003, 'witness'),
  (evt_2001, obs_1004, 'witness');
```

### Issues Identified

1. **Missing father**: Father fields are empty. This is common for children born outside marriage or to enslaved mothers. The absence is meaningful information. How do we record "father unknown" vs "father not recorded"?

2. **Mother as informant**: Carolina is both mother and informant. In PICO terms, this is one PersonObservation with two roles in the event. But should it be two separate observations?

3. **Name structure**: Birth certificates have structured names (fname, prefix, sname). This maps well to PNV. But many enslaved people had only first names. The prefix "van" here might indicate a freed person who took a surname.

4. **Address as text**: "Gravenstraat 42" is an address string. Should this become a place entity? It would require geocoding. For now, storing as text is pragmatic but loses structure.

5. **Signature ability**: "unable to sign" suggests illiteracy or lack of formal education. This is sociohistorical data. Where does it go?

6. **Time precision**: Birth time is "morning, 8 o'clock". We have both `birth_daypart` and `birth_hour`. The hour is more precise. Store both? Just hour?

7. **Certificate vs birth date**: Certificate issued 12 May, birth was 10 May. Two-day gap is normal. But both dates matter: birth date for the person's life, certificate date for legal purposes.

---

## Example 6: Almanakken Entry

### Source Record

From Almanakken dataset, a fictional but realistic example:

```
recordId: ALM_1835_0142
id: 8742
year: 1835
page: 176
district_of_divisie: Boven Commewijne
loc_std: Commewijne River
direction: links afvarend

plantation_std: De Hoop
plantation_org: de Hoop
plantation_id: Q12345678
psur_id: PSUR0042

size_std: 500
product_std: sugar
function: plantation

administrateurs: J. van der Berg; P. Jansen
directeuren: H. de Wit
eigenaren: Estate of C. Bakker

slaven: 180
plantage_mannelijke_niet_vrije_bewoners: 85
plantage_vrouwelijke_niet_vrije_bewoners: 95
plantage_totaal_niet_vrije_bewoners: 180

vrije_bewoners: 3
vrije_personen_op_plantages_mannen: 2
vrije_personen_op_plantages_vrouwen: 1

deserted: no
additional_info: new sugar mill installed
```

### Proposed Storage

**Table: source (the almanac volume)**

```sql
-- One source per almanac volume, not per entry
INSERT INTO source (id, source_type, title, date_year)
VALUES (4001, 'almanac', 'Surinaamsche Almanak 1835', 1835);
```

**Table: place (the plantation)**

```sql
-- Plantation likely already exists; update or link
-- Use psur_id as stable identifier
INSERT INTO place (id, psur_code, place_type, wikidata_id)
VALUES (301, 'PSUR0042', 'plantation', 'Q12345678');
```

**Table: place_observation (what the almanac says about this place in 1835)**

```sql
INSERT INTO place_observation (
  id, place_id, source_id, year,
  district, location_text, direction,
  size_akkers, product, function
)
VALUES (
  pobs_501, 301, 4001, 1835,
  'Boven Commewijne', 'Commewijne River', 'links afvarend',
  500, 'sugar', 'plantation'
);
```

**Table: person_observation (personnel)**

```sql
-- Administrator 1
INSERT INTO person_observation (id, source_id, name_text, role_text)
VALUES (obs_2001, 4001, 'J. van der Berg', 'administrateur');

-- Administrator 2
INSERT INTO person_observation (id, source_id, name_text, role_text)
VALUES (obs_2002, 4001, 'P. Jansen', 'administrateur');

-- Director
INSERT INTO person_observation (id, source_id, name_text, role_text)
VALUES (obs_2003, 4001, 'H. de Wit', 'directeur');

-- Owner (as estate, not individual)
INSERT INTO person_observation (id, source_id, name_text, role_text)
VALUES (obs_2004, 4001, 'Estate of C. Bakker', 'eigenaar');
```

**Table: place_person_role (link personnel to plantation for this year)**

```sql
INSERT INTO place_person_role (place_observation_id, person_observation_id, role)
VALUES
  (pobs_501, obs_2001, 'administrator'),
  (pobs_501, obs_2002, 'administrator'),
  (pobs_501, obs_2003, 'director'),
  (pobs_501, obs_2004, 'owner');
```

**Table: population_count (aggregate statistics)**

```sql
INSERT INTO population_count (
  place_observation_id,
  category, sex, count
)
VALUES
  (pobs_501, 'enslaved', 'M', 85),
  (pobs_501, 'enslaved', 'F', 95),
  (pobs_501, 'free', 'M', 2),
  (pobs_501, 'free', 'F', 1);
```

### Issues Identified

1. **Aggregate vs individual**: Almanakken give population counts, not names. "180 enslaved people" is a statistic, not 180 person records. This is fundamentally different from slave registers. Need separate model for aggregate data.

2. **Personnel name parsing**: "J. van der Berg" has an initial, not a first name. "Estate of C. Bakker" is not a person but a legal entity. Need to distinguish persons from organisations.

3. **Multiple administrators**: Field contains "J. van der Berg; P. Jansen" as semicolon-separated list. Need to parse and create separate observations.

4. **Owner as estate**: "Estate of C. Bakker" implies the owner (C. Bakker) is deceased. This is genealogically relevant but encoded in a text field.

5. **Wikidata linking**: `plantation_id: Q12345678` is a Wikidata QID. This is valuable for disambiguation. But what if our place record was created before we knew the QID? Need update workflow.

6. **Temporal snapshot**: This is data for 1835. The same plantation in 1840 might have different administrators, different population. Each almanac year creates a new place_observation linked to the same place.

7. **Direction encoding**: "links afvarend" (left going downstream) is a historical navigation reference. Valuable for researchers but not easily geocodable. Store as text or controlled vocabulary?

8. **Product and function**: "sugar" and "plantation" seem redundant but are not. A sugar plantation might later become a "provision ground" or be "deserted". These change over time.

9. **Deserted flag**: "no" means operating in 1835. Need to track transitions (operating -> deserted -> re-opened).

10. **No individual enslaved**: Unlike slave registers, we have no names. Cannot link these 180 people to individual records. The aggregate is an observation about the place, not about persons.

---

## Summary of Issues by Category

### Existing Issues (from Examples 1-4)

| #   | Issue                      | Category     | Status                           |
| --- | -------------------------- | ------------ | -------------------------------- |
| 1   | Place linking from text    | Place        | Open                             |
| 2   | Name type (African origin) | Person       | See PNV/PICO                     |
| 3   | Person identity strategy   | Person       | Adopt PICO (separate-with-links) |
| 4   | Occupation storage         | Person       | On PersonObservation per PICO    |
| 5   | Relationship certainty     | Provenance   | Open                             |
| 6   | Temporal precision         | Time         | Open                             |
| 7   | Owner vs plantation        | Organisation | Need relationship types          |
| 8   | Multiple temporal entries  | Time         | Multiple observations            |
| 9   | Cross-source identity      | Person       | person_match table               |
| 10  | Mother linking certainty   | Relationship | Certainty on relationship        |

### New Issues (from Examples 5-6)

| #   | Issue                               | Category  | Status                      |
| --- | ----------------------------------- | --------- | --------------------------- |
| 11  | Missing father (meaningful absence) | Person    | Open                        |
| 12  | Same person, multiple roles         | Event     | Multiple event_role records |
| 13  | Name structure vs single name       | Person    | PNV with extensions         |
| 14  | Address as text vs place entity     | Place     | Pragmatic: text for now     |
| 15  | Signature/literacy data             | Person    | Where to store?             |
| 16  | Time precision (daypart vs hour)    | Time      | Store most precise          |
| 17  | Certificate vs event date           | Event     | Both as separate dates      |
| 18  | Aggregate vs individual data        | Data type | Separate model              |
| 19  | Organisation vs person (estate)     | Entity    | Need organisation entity    |
| 20  | Parsing semicolon-separated names   | Import    | ETL concern                 |
| 21  | Wikidata linking workflow           | ID        | Update procedure            |
| 22  | Temporal snapshots (yearly)         | Time      | place_observation per year  |
| 23  | Historical navigation terms         | Place     | Controlled vocabulary?      |
| 24  | Status transitions (deserted)       | Place     | Temporal state              |

---

## Priority Issues to Resolve

### Must Solve Before Schema

1. **Temporal precision pattern** (#6, #16): Need consistent approach for year-only, date-only, datetime, approximate.

2. **Aggregate data model** (#18): Almanakken population counts need different structure than individual records.

3. **Organisation entity** (#7, #19): Plantations, estates, shipping companies need to be distinct from persons.

4. **Meaningful absence** (#11): How to record "father unknown" vs "father not recorded" vs "father field empty".

### Can Defer

5. Address geocoding (#14): Store as text for now, geocode later.

6. Historical navigation terms (#23): Store as text, consider vocabulary later.

7. Wikidata update workflow (#21): Operational concern, not schema.

---

7 January 2026
