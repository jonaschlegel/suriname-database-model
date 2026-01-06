# Linked Open Data: Notes

> Trying to understand what linked data is, why it might matter for this project, and whether we should actually do it.

---

## What Is This About?

"Linked Open Data" (LOD) is a way of publishing data so that it can connect to other data on the web. The basic idea:

1. Use URIs (web addresses) to identify things
2. When someone looks up a URI, return useful information
3. Include links to other URIs

So instead of my database having a field `birthplace = "Paramaribo"`, it would have `birthplace = https://www.wikidata.org/entity/Q3001`. Anyone who knows what Wikidata is can follow that link and get more information about Paramaribo.

Tim Berners-Lee (inventor of the web) proposed a "five star" rating:

| Stars | What It Means                    |
| ----- | -------------------------------- |
| 1     | Available on the web, any format |
| 2     | Structured data (not just PDF)   |
| 3     | Open format (not Excel)          |
| 4     | Use URIs for things              |
| 5     | Link to other data               |

Right now our data is maybe 2-star (structured CSVs). Five-star would mean publishing it as linked data with connections to Wikidata, GeoNames, etc.

---

## Do We Actually Need This?

**Arguments for linked data:**

1. **Interoperability** - Other projects could use our data without custom parsing
2. **Enrichment** - Following links to Wikidata gets us coordinates, alternate names, related entities
3. **Standards** - Using CIDOC-CRM vocabulary means cultural heritage scholars understand our schema
4. **Discoverability** - Linked data crawlers could find and index our project

**Arguments against (or at least, reasons to wait):**

1. **Complexity** - RDF is harder than SQL
2. **Tooling** - Triple stores are less mature than PostgreSQL
3. **Audience** - Most users won't query our SPARQL endpoint
4. **Premature** - We don't know what our data looks like yet

**My current thinking:** Build in PostgreSQL first. Design with LOD compatibility in mind (use URIs as identifiers, map to standard vocabularies). Export to linked data later.

---

## URIs and Identifiers

Every entity should have a URI. Something like:

```
https://suriname-time-machine.org/person/PERS_0001
https://suriname-time-machine.org/place/LOC_0042
https://suriname-time-machine.org/map/MAP_1763_001
```

If someone requests that URI, they should get information about the entity. In different formats depending on what they ask for:

- Web browser → HTML page
- Machine → JSON-LD or RDF

This is called "content negotiation" and it's fiddly to implement. But the important thing now is to design identifiers that could become URIs later.

**Question:** What domain do we use? We don't have `suriname-time-machine.org`. Maybe we should think about this.

---

## RDF: The Data Model

RDF (Resource Description Framework) represents everything as triples: subject - predicate - object.

```
<PERS_0001> <hasName> "Jan Klaas"
<PERS_0001> <wasBornIn> <LOC_0042>
<LOC_0042> <label> "Paramaribo"
```

This is powerful because:

- You can merge data from different sources (if they use the same predicates)
- Queries can follow chains of relationships
- There's no fixed schema (both good and bad)

But it's awkward because:

- Simple things become verbose
- Querying requires learning SPARQL
- Most tools expect tables, not triples

---

## JSON-LD

JSON-LD is RDF in JSON clothing. It looks like normal JSON:

```json
{
  "@context": "https://schema.org/",
  "@type": "Person",
  "@id": "https://example.org/person/PERS_0001",
  "name": "Jan Klaas",
  "birthPlace": {
    "@id": "https://example.org/place/LOC_0042",
    "name": "Paramaribo"
  }
}
```

The `@context` says "interpret `name` as `schema.org/name`" and so on. Under the hood, it's RDF triples.

This is probably the export format we'd use. It's readable by both humans and machines.

---

## Vocabularies I Keep Seeing

**Schema.org** - General purpose. Person, Place, Event. Used by Google for search results.

**Dublin Core** - Metadata standard. Title, creator, date, description. Good for documents.

**FOAF** (Friend of a Friend) - People and relationships. A bit dated but still used.

**CIDOC-CRM** - Cultural heritage. Very comprehensive but complex. See [cidoc-crm.md](./cidoc-crm.md).

**GeoSPARQL** - Geospatial data. Would be relevant for our maps.

**PROV-O** - Provenance. Who created what, when, based on what. Important for us.

The idea is: reuse existing vocabularies instead of inventing your own. If everyone uses `schema:name` for a person's name, data can be combined.

---

## Wikidata

Wikidata is the most useful external dataset for us. It has:

- Surinamese places with coordinates
- Historical figures (some plantation owners, colonial administrators)
- Stable identifiers (Q-numbers)
- Multilingual labels

Example: Paramaribo is Q3001. I can query Wikidata for its coordinates, population, administrative divisions, etc.

**Practical approach:** Store Wikidata Q-IDs alongside our own identifiers. When we export to linked data, use `owl:sameAs` to say "our LOC_0042 is the same as Wikidata Q3001."

```json
{
  "@id": "https://example.org/place/LOC_0042",
  "owl:sameAs": "http://www.wikidata.org/entity/Q3001"
}
```

**To investigate:** Can we contribute back to Wikidata? Add plantation locations, historical figures from our data?

---

## SPARQL

SPARQL is the query language for RDF data. It looks like SQL but for triples.

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?name ?birthplace
WHERE {
  ?person a schema:Person .
  ?person schema:name ?name .
  ?person schema:birthPlace ?place .
  ?place schema:name ?birthplace .
}
```

You can query across federated endpoints:

```sparql
SELECT ?localPerson ?wikidataLabel
WHERE {
  ?localPerson owl:sameAs ?wikidata .
  SERVICE <https://query.wikidata.org/sparql> {
    ?wikidata rdfs:label ?wikidataLabel .
    FILTER(LANG(?wikidataLabel) = "en")
  }
}
```

This is powerful but I've never actually built a SPARQL endpoint. The tooling seems more complicated than PostgreSQL.

---

## The Provenance Problem

One thing LOD standards do well: provenance. PROV-O lets you say:

- This assertion was generated by this activity
- Which was carried out by this person
- At this time
- Based on this source

```turtle
<interpretation-001> a prov:Entity ;
    prov:wasGeneratedBy <transcription-activity> ;
    prov:wasAttributedTo <researcher-orcid> ;
    prov:wasDerivedFrom <source-document> ;
    prov:generatedAtTime "2025-01-06T12:00:00Z" .
```

This is exactly what we need for tracking interpretations. The [ethical framework](./ethical-framework.md) says every interpretation should be attributed. PROV-O gives us a standard way to do that.

Maybe I should model our interpretation table with PROV-O in mind?

---

## Dead End: Going Full Linked Data Now

I spent a while trying to design the database as a native RDF store. The idea was: use a triple store (like Apache Jena or Blazegraph), model everything in CIDOC-CRM, get linked data "for free."

Problems I ran into:

1. **Spatial queries** - RDF spatial support is weaker than PostGIS
2. **Complex queries** - SPARQL is harder than SQL for ad-hoc analysis
3. **Tooling** - No equivalent to psql, pgAdmin, DBeaver
4. **Learning curve** - I kept making mistakes with RDF syntax

I've shelved this approach. Maybe revisit later if there's demand for a SPARQL endpoint.

---

## Practical Path Forward

1. **Now:** Design PostgreSQL schema with LOD in mind

   - Use stable identifiers that can become URIs
   - Store external IDs (Wikidata, GeoNames) as columns
   - Document mappings to CIDOC-CRM / Schema.org

2. **Later:** Build export pipeline

   - Generate JSON-LD from database
   - Serve at URIs with content negotiation
   - Maybe set up a SPARQL endpoint if people want it

3. **Maybe never:** Full migration to triple store
   - Only if there's a compelling use case
   - Could run triple store alongside PostgreSQL

---

## References

**Heath, Tom, and Christian Bizer.** _Linked Data: Evolving the Web into a Global Data Space_. Morgan and Claypool, 2011.
Free online: http://linkeddatabook.com/
Good introduction, though a bit dated now.

**W3C Linked Data** - https://www.w3.org/standards/semanticweb/data
Official standards and specifications.

**Wikidata Query Service** - https://query.wikidata.org/
Try out SPARQL queries against Wikidata. Good for learning.

**JSON-LD Playground** - https://json-ld.org/playground/
Visualise how JSON-LD maps to RDF triples.

---

_Last edited: 2025-01-06_
