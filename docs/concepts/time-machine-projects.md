# Other Projects: What I've Been Looking At

> Notes on projects I have found, what they're doing, what I can learn from them. Some of these are directly relevant. Others might be dead ends. I'm still figuring it out.

---

## The "Time Machine" idea

There is this big European initiative called Time Machine. The pitch is: digitise everything, extract entities, build a 4D simulation of 2,000 years of European history.
The technical infrastructure is useful: standardised a lot of things that would otherwise be done differently by every project.

The projects under the Time Machine umbrella tend to use:

- CIDOC-CRM for ontology
- IIIF for images
- W3C annotations
- PostgreSQL or triple stores
- JSON-LD for data exchange

---

## Patterns

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
- Dresden, a 4D experience: https://4dbrowser.urbanhistory4d.org/explore/51.04935331701944,13.738145828247072?from=1820-01-01&to=2016-01-12&undated=1&map=1911&model=1930-01-01
- Nijmegen, a bit confusing but media (film) related content: https://open-images-browser.vercel.app/#/?decadeIndex=1&sortBy=date&sortAscending=true&displayFieldsSelected%5B0%5D=thumb&displayFieldsSelected%5B1%5D=title&displayFieldsSelected%5B2%5D=year&activeFilters%5Blocations%5D%5B0%5D=Nijmegen&showPlaylist=false&showTranscript=false&playlistIndex=0&surveyMode=false&transcriptIndex=0
-
