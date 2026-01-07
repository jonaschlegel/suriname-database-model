# Ethical Framework: Working Notes

> These are not finished guidelines. They're questions I keep coming back to, things I've read, worries I have. The "answers" here are provisional.

---

## The Uncomfortable Starting Point

I'm building a database from colonial records. These records exist because of slavery. The death certificates I'm working with? Many of them document enslaved people who were recorded at death because they were property.

That's the foundation. Everything I build sits on top of that.

I've been reading Saidiya Hartman's work on the archive of slavery. She writes about "the violence of the archive" - how the very existence of records about enslaved people is often the result of violence (Hartman, 2008). A person appears in a slave register because they were bought. They appear in a death certificate because their death had to be administratively processed.

**Question I can't answer:** Is building a database from these records an act of recovery, or does it reproduce the violence of turning people into data points?

I don't have a good answer. But I think the question has to stay visible.

---

## What I'm Trying Not to Do

### Don't reproduce colonial categories

The sources categorise people in ways that served colonial purposes:

- "Slave" vs "free"
- "Negro" vs "Mulatto" vs "Mestizo" (racial categories)
- "Creole" vs "African" (place of birth)

I need to record what the sources say. But I don't want my database structure to treat these categories as natural or neutral.

**Idea:** Maybe the category should be stored as an attribute of the source, not of the person? So instead of `person.race = 'Negro'`, it would be `source_assertion(source=death_cert_1830, person=X, attribute='race', value='Negro')`. That makes clear it's what the colonial clerk wrote, not an objective fact.

**Problem:** This is more complicated. Queries become harder. Is the complexity worth it?

### Don't impose false certainty

Colonial administrators made mistakes. They guessed ages. They misspelled names. They confused people with similar names.

I keep wanting to "clean" the data. Standardise the names. Fill in missing dates. Merge duplicate records.

But every "cleaning" decision is an interpretation. If I merge two records because I think they're the same person, I might be wrong. And once merged, that uncertainty disappears.

**Current approach:** Keep the original data separate from interpretations. Let interpretations be explicit, attributed, uncertain.

### Don't forget who's missing

The records are biased towards people the colonial state cared about. That means:

- Plantation owners: well documented
- Enslaved people on plantations: documented (as property)
- Free Black people: sometimes documented
- Maroons (escaped enslaved people): rarely documented
- Indigenous people: almost invisible

If I build my database around "what's in the records," I'm building around colonial priorities.

**Open question:** How do I represent absence? How do I show "there were Maroon communities here, but they don't appear in these records because..."?

---

## Names

This is something I keep coming back to.

The name "Jan" in a slave register is almost certainly not the name this person was given at birth. It's a name imposed by enslavers. The person's actual name, their African name, their Creole name, their Sranan name - usually not recorded.

When I see "Jan" in a record, I should store it. But how do I indicate that this is an imposed name? That there was probably another name that we don't know?

Enslaved.org has a good approach here. They have name types: "given name," "enslaver-given name," "self-identified name," etc. See their data model documentation at https://enslaved.org/

**My current thinking:**

```sql
CREATE TABLE person_name (
    person_id INTEGER,
    name VARCHAR(255),
    name_type VARCHAR(50),  -- 'enslaver_given', 'self_identified', 'unknown_origin', etc.
    source_id INTEGER,
    notes TEXT
);
```

But I'm not sure "enslaver_given" is the right term. And what do I do when I don't know the origin of a name (which is most of the time)?

---

## Violence in the Records

Some of the death certificates record cause of death. Some of those causes are violence - executions, punishments, "accidents" that were probably not accidents.

Do I include this data?

Arguments for:

- It's historically important
- Descendants might want to know
- Hiding it is a form of sanitisation

Arguments against:

- It can be sensationalised
- Out of context, it can reinforce stereotypes
- The person can't consent to having their suffering made public

I've read the Enslaved.org guidelines on this. They suggest: include the data, but consider access restrictions and contextualisation. Don't make violence searchable as a category. Don't build visualisations that highlight suffering.

**My current position:** Include cause of death if recorded. Don't make it a filterable category. Add a field for content warnings. Think carefully before putting this in any public interface.

---

## The "For Whom" Question

Who is this database for?

1. **Researchers** - academics studying Surinamese history
2. **Descendants** - people looking for their ancestors
3. **The Surinamese public** - broader cultural heritage
4. **The Dutch public** - understanding colonial history

These audiences have different needs and different relationships to the data.

For researchers: they want queryable data, API access, export formats
For descendants: they want to find specific people, see connections, maybe contribute
For the public: they want narratives, context, visualisations

I keep defaulting to "researcher" because that's what I know. But the descendants are arguably the most important audience. These are their ancestors.

**To do:** Talk to someone from the Surinamese community about what they would want from a project like this.

---

## Language Choices

Small things that matter:

- "Enslaved person" not "slave" - emphasises that slavery was something done to people, not what they were
- "Enslaver" not "owner" - you can't own a person
- "Plantation" is tricky - it's the standard term, but it sanitises what was really a labour camp

I'm writing documentation in English, but many of the sources are in Dutch. And the people in the records spoke various languages: Dutch, Sranan Tongo, African languages, Indigenous languages.

The database itself will store data in original language plus translations where available. But there's a power dynamic in which language becomes the "default."

---

## Certainty and Uncertainty

I've settled on four certainty levels for interpretations:

- **definite** - multiple sources confirm, no reasonable doubt
- **probable** - strong evidence, most likely interpretation
- **possible** - plausible but not proven
- **uncertain** - we really don't know

But I'm second-guessing this. Is "definite" ever really appropriate for historical data? Even when multiple sources agree, they could all be copying from the same mistake.

Maybe I should rename "definite" to something like "well-attested" or "strongly-supported"? That's more honest about what we can actually know.

**Reference:** There's a literature on uncertainty in historical databases. I should read more of it. Start with: Gregory & Ell (2007) on historical GIS.

---

## Schema Implications (Tentative)

What I think I need:

1. **Multiple names per person** with name types and sources
2. **Explicit interpretation table** - every claim is attributed
3. **Source bias field** - note what each source can and can't tell us
4. **Category provenance** - racial categories belong to sources, not people
5. **Content sensitivity flags** - for violence, trauma, etc.

I'm not sure about:

- How to represent "missing" data (absence vs. unknown)
- Whether to have a separate "community/family" entity
- How to handle contested interpretations (scholars disagree about X)

---

## What I've Been Reading

These are shaping how I think about this. For a fuller bibliography, see [references.md](./references.md).

### On the Archive and Its Violence

**Hartman, Saidiya.** "Venus in Two Acts." _Small Axe_ 12, no. 2 (2008): 1-14.
The most important piece for me. About what we can and can't recover from the archive. "How does one revisit the scene of subjection without replicating the grammar of violence?" I keep returning to her question of whether recovery is even possible.

**Fuentes, Marisa J.** _Dispossessed Lives: Enslaved Women, Violence, and the Archive_. Philadelphia: University of Pennsylvania Press, 2016.
Uses fragmentary sources to reconstruct lives of enslaved women in Barbados. Good model for working with limited data. Her chapter "Enraged, Diabolic Woman" is a masterclass in reading against the grain.

**Trouillot, Michel-Rolph.** _Silencing the Past: Power and the Production of History_. Boston: Beacon Press, 1995.
On how historical silences are produced. The chapter on the Haitian Revolution is famous, but the theoretical framework applies to any colonial archive.

**Stoler, Ann Laura.** _Along the Archival Grain: Epistemic Anxieties and Colonial Common Sense_. Princeton: Princeton University Press, 2009.
Not specifically about slavery, but essential for thinking about what colonial archives do, how they were produced, what they reveal about colonial governance.

### On Digital Methods and Slavery

**Johnson, Jessica Marie.** "Markup Bodies: Black [Life] Studies and Slavery [Death] Studies at the Digital Crossroads." _Social Text_ 36, no. 4 (2018): 57-79.
Critical examination of how slavery databases mark up Black bodies. Required reading before building any database of enslaved people. She asks hard questions about what databases do to people.

**Gallon, Kim.** "Making a Case for the Black Digital Humanities." In _Debates in the Digital Humanities 2016_, edited by Matthew K. Gold and Lauren F. Klein. Minneapolis: University of Minnesota Press, 2016.
On why mainstream digital humanities methods may not serve Black history well. Makes me question my assumptions.

**Risam, Roopika.** _New Digital Worlds: Postcolonial Digital Humanities in Theory, Praxis, and Pedagogy_. Evanston: Northwestern University Press, 2019.
Broader than just slavery, but essential on decolonising digital methods.

### On Valuation and Names

**Berry, Daina Ramey.** _The Price for Their Pound of Flesh: The Value of the Enslaved, from Womb to Grave, in the Building of a Nation_. Boston: Beacon Press, 2017.
On how enslaved people were valued economically. Relevant because our plantation registers and inventories are economic documents. Helps me understand what the sources were actually _for_.

**Morgan, Jennifer L.** _Reckoning with Slavery: Gender, Kinship, and Capitalism in the Early Black Atlantic_. Durham: Duke University Press, 2021.
On reproduction, kinship, and slavery's political economy. Challenges how we think about "demographic data."

**Zeuske, Michael.** "The Names of Slavery and Beyond: The Atlantic, the Americas and Cuba." In _The Second Slavery_, edited by Javier Laviña and Michael Zeuske, 15-50. Berlin: LIT Verlag, 2014.
On naming practices. What names tell us (and don't).

---

## Projects I Should Learn From

- **Enslaved.org** (https://enslaved.org) - Most directly relevant. They've thought hard about these issues.
- **Freedom on the Move** (https://freedomonthemove.org) - Crowdsourced transcription of runaway ads
- **Slave Voyages** (https://slavevoyages.org) - The big trans-Atlantic trade database
- **UCL Legacies of British Slavery** (https://www.ucl.ac.uk/lbs/) - Compensation records after abolition

**To do:** Email Enslaved.org and ask about their decision-making process. How did they handle the hard cases?

---

## Questions I'm Sitting With

1. Can a database ever adequately represent a person's life, or is it always a reduction?

2. When I make an uncertain interpretation, who bears the risk of being wrong - me, future researchers, or descendants?

3. Is it ethical to make this data more accessible, if accessibility enables misuse?

4. How do I balance transparency (showing the messy colonial origins of the data) with usability (making the data useful)?

5. What would the people in these records want?

I don't have answers to most of these. I'm not sure answers are possible. But I want to keep asking them.

---

---

7 January 2026
