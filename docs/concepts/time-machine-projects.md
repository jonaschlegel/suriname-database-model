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

**Question I keep coming back to:** Is compatibility with European projects the right goal? The Surinamese context is different. The ethical considerations are different. Maybe I should be looking more at Caribbean and slavery-focused projects?

- Are there any time machine project collectives outside of Europe https://www.timemachine.eu/ ?

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

Closer to home. They are integrating archives from the Stadsarchief Amsterdam with historical maps.

Their architecture document is helpful. They describe a layered model:

1. Source layer (raw digitised documents)
2. Extraction layer (structured data from sources)
3. Entity layer (reconciled people, places, events)
4. Interpretation layer (scholarly assertions)

This maps almost exactly to what I've been thinking about for the [location model](../models/location-model.md). I must have absorbed it from them without realising.

---

## Common Patterns I Notice

Looking across these projects, some things keep coming up:

- On time: Everyone needs and works with fuzzy dates. "Circa 1780." "Before 1800." "1780s." Standard date types don't handle this well. Projects either use date ranges or custom encoding.
- On space: GIS-like/PostGIS shows up everywhere. Even projects using triple stores often have a PostgreSQL/PostGIS layer for spatial queries.
- On provenance: Every assertion should be traceable to a source. This is non-negotiable. How to implement it varies (separate table, embedded metadata, RDF provenance).
- On sustainability: Projects die when funding runs out. The ones that survive have institutional homes, community ownership, or very simple infrastructure. Here we really should talk with the Huygens DI departement.

---

## Time Machine Projects

- Time Machine Europe: https://www.timemachine.eu/
- other european projects are collected here: https://www.timemachine.eu/ltms/, structured as `related projects` and `datasets`
- Mars Time Machine: https://projects.research-and-innovation.ec.europa.eu/en/horizon-magazine/mars-time-machine-researchers-create-virtual-model-decode-red-planets-climate-evolution
- Gouda Time Machine: https://viewer.goudatijdmachine.nl/
