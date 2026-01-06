# W3C Web Annotations and re:Charted: Working Notes

> How the annotation system works, what I understand, what I'm still confused about.

---

## Why This Matters

The idea is: we have historical maps. We want to mark things on them. Text, symbols, locations. And we want those marks to be more than just drawings. We want them to be data.

That's what W3C Web Annotations are for. A standard way to say "this region of this image contains this text" or "this symbol represents a building" or "this location is the same as Wikidata Q-whatever."

We're not building the annotation tools ourselves. The GLOBALISE project already built them (re:Charted viewer, AnnoRepo storage). We're trying to plug into their infrastructure.

---

## The Basic Structure

Every annotation has the same shape:

```json
{
  "type": "Annotation",
  "target": "what you're annotating",
  "body": "what you're saying about it"
}
```

The target is usually a region of an image (specified with coordinates). The body is the content: a transcription, a classification, a link to another entity.

Plus metadata: who made the annotation, when, why.

In JSON-LD it looks like this:

```json
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "id": "https://annorepo.example.org/annotations/abc123",
  "type": "Annotation",
  "motivation": "textspotting",
  "target": {
    "source": "https://iiif.example.org/map/canvas/1",
    "selector": {
      "type": "SvgSelector",
      "value": "<svg><polygon points='100,100 200,100 200,150 100,150'/></svg>"
    }
  },
  "body": {
    "type": "TextualBody",
    "value": "De Hoop",
    "purpose": "transcribing"
  },
  "creator": {
    "id": "https://orcid.org/0000-0002-4190-9566",
    "type": "Person"
  },
  "created": "2025-01-06T12:00:00Z"
}
```

---

## The Three Types We Use

re:Charted defines three "motivations" (reasons for annotating):

### 1. textspotting

Identifying text on the map. Usually starts with AI detection (their Loghi HTR model), then gets corrected by humans.

What I like about this: the annotation can have multiple bodies with different sources. The AI transcript, the human correction, maybe a second human opinion. They all live together.

```json
"body": [
  {
    "value": "RO: DEMEDEL",
    "purpose": "transcribing",
    "generator": "Loghi HTR"
  },
  {
    "value": "Ro: de Medel",
    "purpose": "transcribing",
    "creator": { "type": "Person" }
  }
]
```

**Question:** If there are multiple transcriptions, which one do I use when importing to our database? The human one, I assume. But what if there are multiple humans who disagree?

### 2. iconography

Identifying symbols. A building icon. A tree. A ship. The body contains a classification.

```json
"body": {
  "type": "TextualBody",
  "value": "building",
  "purpose": "classifying"
}
```

Seems straightforward. Though I wonder about the vocabulary. What are the valid classifications? Is there a controlled list, or can you type anything?

**To check:** Look at the re:Charted documentation for the iconography vocabulary.

### 3. linking

This is where it gets interesting. A linking annotation connects other annotations to external entities. The target isn't a region of the map; it's a reference to another annotation.

```json
{
  "motivation": "linking",
  "target": [
    "https://annorepo.example.org/annotations/textspotting-001",
    "https://annorepo.example.org/annotations/textspotting-002"
  ],
  "body": [
    {
      "purpose": "identifying",
      "source": {
        "id": "https://www.wikidata.org/entity/Q12345",
        "type": "Place"
      }
    },
    {
      "purpose": "geotagging",
      "source": { ... },
      "selector": {
        "type": "PointSelector",
        "x": 150,
        "y": 125
      }
    }
  ]
}
```

So if I have two text annotations that both say "Paramaribo," I can create a linking annotation that says "these two annotations both refer to Wikidata Q3001" and "the geographic location on the map is at pixel coordinates (150, 125)."

**This is powerful but confusing.** The target of a linking annotation is other annotations, not the map. And there can be multiple bodies with different purposes (identifying, geotagging, selecting). I've read the spec twice and I'm still not sure I understand all the cases.

---

## Selectors

How do you specify a region of an image? With selectors.

### SVG Selector

For irregular shapes (most text bounding boxes):

```json
{
  "type": "SvgSelector",
  "value": "<svg><polygon points='x1,y1 x2,y2 x3,y3 x4,y4'/></svg>"
}
```

The coordinates are in image pixels. Top-left is (0,0).

### Point Selector

For single points (used in geotagging):

```json
{
  "type": "PointSelector",
  "x": 150.5,
  "y": 125.0
}
```

### Fragment Selector

For rectangles (simpler but less precise):

```json
{
  "type": "FragmentSelector",
  "value": "xywh=100,100,200,50"
}
```

x, y, width, height.

---

## The Coordinate System Problem

The annotations use image pixel coordinates. Our database needs geographic coordinates (latitude/longitude).

To convert between them, you need a georeferencing transform. That's the mapping from pixel space to geographic space.

For a simple affine transform:

```
lon = a*x + b*y + c
lat = d*x + e*y + f
```

Six parameters. These come from the georeferencing step in QGIS, where you identify control points (pixels that you know the real-world coordinates of).

**The problem:** Each map has a different transform. And the transforms have errors. So when I say "this annotation is at (150, 125)," I can convert that to roughly (-55.2, 5.8), but the "roughly" matters.

**My current thinking:** Store both coordinate systems. The pixel coordinates are authoritative (that's where the annotation actually is on the image). The geographic coordinates are derived and have uncertainty.

---

## AnnoRepo

AnnoRepo is where the annotations live. It's a service developed by the Huygens Institute (same people as GLOBALISE).

API basics:

```
GET    /w3c/{container}/              # List annotations in a container
GET    /w3c/{container}/{id}          # Get one annotation
POST   /w3c/{container}/              # Create new annotation
PUT    /w3c/{container}/{id}          # Update annotation
DELETE /w3c/{container}/{id}          # Delete annotation
```

The container is like a folder. Our project would have its own container.

**Authentication:** I haven't figured this out yet. The GLOBALISE AnnoRepo is presumably access-controlled. Do we run our own instance, or do we get access to theirs?

**To do:** Email the GLOBALISE/Huygens team about access and hosting options.

---

## How I Think We Should Integrate

### Import flow

1. Fetch annotations from AnnoRepo (either pull periodically, or webhook on changes)
2. Parse the JSON-LD
3. For textspotting: extract transcription, store in our database, try to match to known place names
4. For linking: follow the external ID links, update our records with Wikidata/GeoNames references
5. Keep the original annotation URI so we can trace back

### Export flow (later)

1. When we create interpretations in our database, generate W3C annotations
2. Push to AnnoRepo
3. Now re:Charted can show our interpretations alongside the original annotations

### Schema for storing annotations

I'm thinking something like:

```sql
CREATE TABLE web_annotation (
    id SERIAL PRIMARY KEY,
    annotation_uri TEXT UNIQUE NOT NULL,
    motivation VARCHAR(50),
    target_canvas TEXT,
    body_json JSONB,
    creator_orcid TEXT,
    created_at TIMESTAMP,
    imported_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE annotation_to_entity (
    annotation_id INTEGER REFERENCES web_annotation(id),
    entity_type VARCHAR(50),  -- 'place', 'person', etc.
    entity_id INTEGER,
    certainty VARCHAR(20),
    interpreted_by TEXT,
    interpreted_at TIMESTAMP DEFAULT NOW()
);
```

The first table stores the raw annotation. The second links it to our entities.

**Open question:** Should I store the full body_json or extract the fields I need? Full JSON preserves everything but makes querying harder. Extracted fields are easier to query but lose information.

Currently leaning towards: store full JSON, but also extract key fields into columns for easy querying.

---

## GAVOC

GAVOC (Gazetteer of VOC) is a database of historical place names from VOC documents. It's part of the Necessary Reunions project.

It has 11,000+ places with:

- Historical spellings
- Modern equivalents
- GeoNames IDs (sometimes)
- Coordinates

The idea is: when you transcribe a place name on a map, you can look it up in GAVOC to find what it maps to.

**Problem for us:** GAVOC is VOC (East Indies). We're WIC (West Indies). The places don't overlap. There isn't a "Gazetteer of WIC" as far as I know.

**Option 1:** Build our own place name lookup. Time-consuming but gives us exactly what we need.

**Option 2:** Use GeoNames/Wikidata directly. Less historical context but more coverage.

**Option 3:** Contribute to building a WIC version of GAVOC. Would benefit other projects but is a big undertaking.

For now, probably option 2 with the goal of working towards option 3.

---

## Things I'm Still Confused About

1. **How do you handle conflicting annotations?** If two people link the same text to different places, what happens?

2. **What's the workflow for corrections?** If I import an annotation and later realise it's wrong, do I update it in AnnoRepo, or just in my database?

3. **Who owns what?** If GLOBALISE creates an annotation on a map, and I create a linking annotation that references their annotation, who controls the link? Can they delete their annotation without breaking mine?

4. **Performance:** Is it practical to fetch all annotations for a map every time? There could be thousands. Is there pagination? Incremental sync?

5. **Offline workflow:** Can I work with annotations when not connected to AnnoRepo? Or is it always live?

---

## References

**W3C Web Annotation Data Model** - https://www.w3.org/TR/annotation-model/
The spec. Dense but authoritative.

**W3C Web Annotation Protocol** - https://www.w3.org/TR/annotation-protocol/
How to create/update/delete annotations via API.

**IIIF Presentation API** - https://iiif.io/api/presentation/3.0/
How the images are served. Annotations reference IIIF canvases.

**AnnoRepo** - https://github.com/knaw-huc/annorepo
The repository software. Open source.

**re:Charted** - https://necessaryreunions.org/viewer
The viewer/editor. The documentation is thin, but the tool itself is usable.

---

## Next Steps for Me

- [ ] Get access to a test AnnoRepo container
- [ ] Write a script to fetch and parse annotations
- [ ] Try creating an annotation programmatically
- [ ] Figure out the authentication story
- [ ] Test the georeferencing transform with real data

---

_Last edited: 2025-01-06_
