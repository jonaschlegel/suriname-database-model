# Other Projects: What I've Been Looking At

> Notes on projects I've found, what they're doing, what I can learn from them. Some of these are directly relevant. Others might be dead ends. I'm still figuring it out.

---

## The "Time Machine" Idea

There's this big European initiative called Time Machine. The pitch is: digitise everything, extract entities, build a 4D simulation of 2,000 years of European history. Ambitious doesn't cover it.

I'm sceptical of the grand vision (how do you simulate history?) but the technical infrastructure is useful. They've standardised a lot of things that would otherwise be done differently by every project.

The projects under the Time Machine umbrella tend to use:

- CIDOC-CRM for ontology
- IIIF for images
- W3C annotations
- PostgreSQL or triple stores
- JSON-LD for data exchange

So if I build something compatible with this stack, I could potentially share data with Venice, Amsterdam, etc.

**Question I keep coming back to:** Is compatibility with European projects the right goal? The Surinamese context is different. The ethical considerations are different. Maybe I should be looking more at Caribbean and slavery-focused projects.

---

## Venice Time Machine

Venice is the flagship. They've been at it for years, have funding, institutional backing. They're digitising millions of pages from the Venetian archives and extracting entities.

What impressed me:

- They handle temporal change well (buildings that no longer exist, streets that changed names)
- Good visualisation of uncertainty
- They've thought hard about how to connect archival records to physical space

What I'm not sure about:

- Their scale is massive. We're tiny by comparison. Does their approach scale down?
- Venice has incredible archival continuity. Suriname has gaps, losses, colonial destruction.
- They're modelling a republic that documented itself. We're modelling a colony that documented people as property.

**Useful specific thing:** Their approach to multi-temporal places. A building has a geometry, but the geometry changes over time. Instead of versioning the geometry, they have "geometry validity periods." I should look at this more.

---

## Amsterdam Time Machine

Closer to home (literally, I'm based in the Netherlands). They're integrating archives from the Stadsarchief Amsterdam with historical maps.

Their architecture document is helpful. They describe a layered model:

1. Source layer (raw digitised documents)
2. Extraction layer (structured data from sources)
3. Entity layer (reconciled people, places, events)
4. Interpretation layer (scholarly assertions)

This maps almost exactly to what I've been thinking about for the [location model](../models/location-model.md). I must have absorbed it from them without realising.

**Connection to Suriname:** Amsterdam was the centre of the WIC (Dutch West India Company). Some of the Suriname records I care about originated in Amsterdam. So there might be actual data overlap, not just methodological overlap.

**To do:** Email the Amsterdam Time Machine people and ask about WIC records.

---

## Enslaved.org

This is the most directly relevant project for us. They've built a database of people who were enslaved, enslaved others, or were involved in the slave trade.

What they do well:

- Person-centric (not plantation-centric or voyage-centric)
- Multiple names per person with types (given name, enslaver-given name, self-identified)
- Uncertainty is first-class (date ranges, not precise dates; certainty flags)
- Good provenance tracking
- API access

I've read their data model documentation carefully. Key insight: they don't try to merge people unless they're confident. Better to have two separate records for what might be the same person than to merge and lose the distinction.

This is the opposite of what I'd do instinctively (clean the data! deduplicate!) but it's the right approach for uncertain historical data.

**Worry:** They're primarily American and Caribbean (British Caribbean). Not sure how much coverage they have of Dutch Suriname. Might be worth contributing our data to them eventually?

**Also:** They've thought about the ethics in ways I haven't fully absorbed yet. Their principles include things like "center the lives of the enslaved, not the transactions."

---

## Slave Voyages

The big trans-Atlantic database. 36,000+ voyages documented. It's been around since the 1990s in various forms.

What I learned from them:

### On uncertainty

They distinguish:

- Documented values (from primary sources)
- Imputed values (estimated from patterns)
- Calculated values (derived from other fields)

Every field has both a value and a flag indicating its status. This is more detailed than my simple certainty levels.

### On visualisation

Their maps and charts are compelling. They show flows, volumes, temporal patterns. It makes the scale of the trade visceral in a way tables don't.

### Limitation for us

Slave Voyages is about the trade. Our focus is mostly post-arrival. The people in our death certificates were (mostly) not recently arrived. They were born in Suriname, lived there, died there. So Slave Voyages is contextual but not directly overlapping.

**Possible connection:** Some of our sources might record African origin (though this becomes rarer over time as the Creole population grew). Could try to link those individuals to Slave Voyages data on arrivals.

---

## Freedom on the Move

American project documenting runaway ads from US newspapers. Interesting because:

1. They crowdsource transcription (we might need to do this)
2. They handle biased sources explicitly (ads written by enslavers)
3. They focus on resistance, not just victimisation

The crowdsourcing model: multiple volunteers transcribe each ad, then there's a review process for consensus. This catches errors and surfaces ambiguity.

**Not directly relevant** because we don't have runaway ads in our sources. Suriname had different enforcement mechanisms. But the methodology around biased sources applies.

---

## GLOBALISE

Dutch project on VOC (East India Company) archives. They've developed:

- Loghi HTR (handwriting recognition for Dutch)
- AnnoRepo (W3C annotation storage)
- re:Charted (annotation interface)

This is directly relevant because we're using re:Charted. The tools came from GLOBALISE.

**The connection:** GLOBALISE is VOC (East Indies). We're WIC (West Indies). Different companies, different geographies. But same language, similar documents, overlapping time period.

I've wondered whether their entity extraction models would work for Suriname documents. The Dutch changed over time, but 18th-century VOC Dutch should be close to 18th-century WIC Dutch?

**Dead end:** I tried using their pre-trained HTR model on a Suriname document. Results were poor. The handwriting styles are different, the vocabulary is different. Would need to train a new model.

---

## Projects I Looked At But Won't Use Directly

### CWRC (Canadian Writing Research Collaboratory)

Literary history project. Good on uncertain biographies, multiple versions of events. But too focused on literary figures. The data model assumes subjects who left textual traces.

### Pelagios

Historical gazetteer federation. Good for linking place names across projects. But their coverage of Suriname is thin. Worth contributing to, not drawing from.

### Seshat

Global history database. Quantitative, comparative. Not useful for individual-level data. Different goals.

### LinkedPasts

Temporal extensions to LOD for historical data. Interesting but too abstract for where I am now. Maybe revisit when I'm designing the RDF export.

---

## Common Patterns I Notice

Looking across these projects, some things keep coming up:

### On identity

Everyone struggles with entity resolution. When are two records the same person? Most projects err on the side of caution: keep separate, link with uncertainty, don't merge.

### On time

Everyone needs fuzzy dates. "Circa 1780." "Before 1800." "1780s." Standard date types don't handle this well. Projects either use date ranges or custom encoding.

### On space

PostGIS shows up everywhere. Even projects using triple stores often have a PostgreSQL/PostGIS layer for spatial queries.

### On provenance

Every assertion should be traceable to a source. This is non-negotiable. How to implement it varies (separate table, embedded metadata, RDF provenance).

### On sustainability

Projects die when funding runs out. The ones that survive have institutional homes, community ownership, or very simple infrastructure. I should think about this more.

---

## What I'm Taking From All This

1. **Start with structured sources.** All these projects started with registers, inventories, formal records. The messier sources came later.

2. **Don't over-normalise early.** Keep the original structure accessible. I can always normalise more later.

3. **Uncertainty is structural, not cosmetic.** Build it into the data model from day one.

4. **Connect to existing identifiers.** Wikidata, GeoNames, VIAF. Even if our coverage is thin, the hooks should be there.

5. **Person-centric, not document-centric.** The unit of analysis is the person, even when the unit of evidence is the document.

6. **Ethics can't be an afterthought.** Enslaved.org built their ethical framework before their data model. That's the right order.

---

## Things I Still Need to Read

- [ ] The Amsterdam Time Machine architecture document in detail
- [ ] Enslaved.org's actual data model (not just the principles)
- [ ] Slave Voyages documentation on imputation methods
- [ ] LinkedPasts temporal extension spec
- [ ] The Venice Time Machine paper on spatiotemporal representation

---

## References

For a full bibliography, see [references.md](./references.md).

### Time Machine Projects

**Kaplan, Frédéric.** "The Venice Time Machine." In _Proceedings of the 2015 ACM Symposium on Document Engineering_, 73-73. New York: ACM, 2015.
Brief overview. More detail at https://www.timemachine.eu/

**Kaplan, Frédéric, and Isabella di Lenardo.** "Big Data of the Past." _Frontiers in Digital Humanities_ 4 (2017): 12.
On the vision of large-scale historical data extraction. Ambitious but thought-provoking.

**Time Machine Europe.** "Time Machine Technical White Paper." 2019. https://www.timemachine.eu/
Technical architecture documentation.

### Slavery Databases

**Eltis, David, and David Richardson.** "A New Assessment of the Transatlantic Slave Trade." In _Extending the Frontiers: Essays on the New Transatlantic Slave Trade Database_, edited by David Eltis and David Richardson, 1-60. New Haven: Yale University Press, 2008.
Methodology behind Slave Voyages. Essential reading on handling uncertainty and imputation.

**Hawthorne, Walter, Daryle Williams, and Dean Rehberger, dirs.** _Enslaved: Peoples of the Historical Slave Trade_. Michigan State University: Matrix Center for Digital Humanities & Social Sciences, 2024. https://enslaved.org/
The project itself. Documentation at https://docs.enslaved.org/ is required reading.

**Journal of Slavery and Data Preservation.** https://jsdp.enslaved.org/
Peer-reviewed journal publishing slavery datasets. Good for methodology and standards.

**Hall, Gwendolyn Midlo.** _Databases for the Study of Afro-Louisiana History and Genealogy, 1699-1860_. Baton Rouge: Louisiana State University Press, 2000.
One of the earliest slavery databases. Documentation of methodology and limitations.

### Digital Humanities Methods

**Rehbein, Malte.** "On Modeling Historical Knowledge Graphs." Presented at DH2019, Utrecht, 2019.
On the challenge of modelling historical knowledge in graph structures.

**Brown, Vincent.** "Mapping a Slave Revolt: Visualizing Spatial History through the Archives of Slavery." _Social Text_ 33, no. 4 (2015): 134-141.
Reflections on visualisation choices and their implications. Honest about the challenges.

---

7 January 2026
