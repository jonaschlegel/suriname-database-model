# References & Citations

> Academic citations for the Suriname Database Model project, formatted in BibTeX style for Zotero integration.

## How to Use This File

References are organized by category and use a citation key format: `[AuthorYear]` or `[AuthorYear-keyword]`.

**In-text citation example:**

> The relational model was first proposed by Codd [@Codd1970], establishing the foundation for modern database systems.

---

## Related Data Sources - Primary Datasets

### Suriname Plantagen Dataset

```bibtex
@dataset{RosenbaumFeldbrugge2024-plantagen,
  author       = {Rosenbaum-Feldbrügge, Matthias and
                  Maurits, Rick J. A.B. and
                  Mauritz, Janssen, Jasanthan and
                  Quanjer, Björn and
                  van Oort, Thunnis and
                  Jak, Jay and
                  van Galen, Coen},
  title        = {{Suriname Plantagen Dataset Version 1.1}},
  year         = {2024},
  publisher    = {IISH Data Collection},
  version      = {V1},
  doi          = {10.17026/SS/YOFINK},
  url          = {https://hdl.handle.net/10622/YOFINK},
  note         = {Data Rows: 375, Data Columns: 15. License: CC BY-SA 4.0}
}
```

### Suriname Death Certificates

```bibtex
@dataset{vanOort2023-deathcert,
  author       = {van Oort, Thunnis and others},
  title        = {{Suriname Death Certificates 1845-1915 Version 1.0}},
  year         = {2023},
  publisher    = {IISH Data Collection},
  version      = {1.0},
  url          = {https://hdl.handle.net/10622/...},
  note         = {Data Rows: 192,335, Data Columns: 38. License: CC BY-SA 4.0}
}
```

### Paramaribo Birth Certificates

```bibtex
@dataset{Collection2024-birthcert,
  author       = {{NL-HaNA Collection}},
  title        = {{Paramaribo Birth Certificates 1828-1921 Version 1.0}},
  year         = {2024},
  publisher    = {IISH Data Collection},
  version      = {1.0},
  doi          = {10.17026/FUBB05},
  url          = {https://hdl.handle.net/10622/FUBB05},
  note         = {Data Rows: 63,200, Data Columns: 32. License: CC BY-SA 4.0}
}
```

### Paramaribo Ward Registers

```bibtex
@dataset{KasteleijnvanOort2024-ward,
  author       = {Kasteleijn, Karel-Jan and
                  Oort, Aiko and
                  Sildani, Molly and
                  Janssen, Carlo and
                  Kruizevanger, Nicky and
                  Olav, Glen and
                  van Crey, Thando},
  title        = {{Paramaribo Ward Registers 1828-1847}},
  year         = {2024},
  publisher    = {IISH Data Collection},
  version      = {V1},
  doi          = {10.17026/SS/VAQF63},
  url          = {https://hdl.handle.net/10622/SS/VAQF63},
  note         = {Data Rows: 102,260, Data Columns: 40. License: CC BY-NC-SA 4.0}
}
```

### Suriname Slave and Emancipation Registers

```bibtex
@dataset{RosenbaumFeldbrugge2023-emancipation,
  author       = {Rosenbaum-Feldbrügge, Matthias and
                  Maurits, Rick J. A.B. and
                  Mauritz, Janssen, Jasanthan and
                  Quanjer, Björn and
                  van Oort, Thunnis and
                  Jak, Jay and
                  van Galen, Coen},
  title        = {{Suriname Slave and Emancipation Registers Dataset Version 1.1}},
  year         = {2023},
  publisher    = {IISH Data Collection},
  version      = {V2},
  doi          = {10.17026/SS/MSJBAN},
  url          = {https://hdl.handle.net/10622/MSJBAN},
  note         = {Data Rows: 95,388, Data Columns: 38. License: CC BY-SA 4.0}
}
```

### Plantations Surinaamse Almanakken

```bibtex
@dataset{vanOort2023-almanakken,
  author       = {van Oort, Thunnis and
                  Altink, Hera and
                  Sanders, Doortje and
                  Smith, Rik and
                  Piault, Damion and
                  Rosenbaum-Feldbrügge, Matthias and
                  Quanjer, Björn and
                  van Galen, Coen},
  title        = {{Plantations Surinaamse Almanakken}},
  year         = {2023},
  publisher    = {IISH Data Collection},
  version      = {V1},
  doi          = {10.17026/SS/MVOJY5},
  url          = {https://hdl.handle.net/10622/MVOJY5},
  note         = {Data Rows: 22,000, Data Columns: 60. License: CC BY-SA 4.0}
}
```

---

## Theoretical Foundations

### Relational Database Theory

```bibtex
@article{Codd1970,
  author    = {Codd, Edgar F.},
  title     = {{A Relational Model of Data for Large Shared Data Banks}},
  journal   = {Communications of the ACM},
  volume    = {13},
  number    = {6},
  pages     = {377--387},
  year      = {1970},
  doi       = {10.1145/362384.362685},
  note      = {The foundational paper introducing the relational model}
}
```

```bibtex
@book{Date2019,
  author    = {Date, C.J.},
  title     = {{Database Design and Relational Theory: Normal Forms and All That Jazz}},
  edition   = {2nd},
  publisher = {Apress},
  year      = {2019},
  isbn      = {978-1484255391}
}
```

### Linked Open Data & Semantic Web

```bibtex
@misc{BernersLee2006-linkeddata,
  author    = {Berners-Lee, Tim},
  title     = {{Linked Data - Design Issues}},
  year      = {2006},
  url       = {https://www.w3.org/DesignIssues/LinkedData.html},
  note      = {The original design principles for Linked Data}
}
```

```bibtex
@techreport{W3C2014-rdf,
  author      = {{W3C}},
  title       = {{RDF 1.1 Concepts and Abstract Syntax}},
  institution = {World Wide Web Consortium},
  year        = {2014},
  type        = {W3C Recommendation},
  url         = {https://www.w3.org/TR/rdf11-concepts/}
}
```

```bibtex
@article{Heath2011-linkeddata,
  author    = {Heath, Tom and Bizer, Christian},
  title     = {{Linked Data: Evolving the Web into a Global Data Space}},
  journal   = {Synthesis Lectures on the Semantic Web: Theory and Technology},
  volume    = {1},
  number    = {1},
  pages     = {1--136},
  year      = {2011},
  doi       = {10.2200/S00334ED1V01Y201102WBE001}
}
```

### CIDOC-CRM (Cultural Heritage)

```bibtex
@techreport{CIDOC2024-crm,
  author      = {{CIDOC CRM Special Interest Group}},
  title       = {{Definition of the CIDOC Conceptual Reference Model}},
  institution = {ICOM/CIDOC},
  year        = {2024},
  version     = {7.1.3},
  url         = {https://www.cidoc-crm.org/Version/version-7.1.3},
  note        = {The ISO 21127:2014 standard for cultural heritage documentation}
}
```

```bibtex
@article{Doerr2003-cidoc,
  author    = {Doerr, Martin},
  title     = {{The CIDOC Conceptual Reference Model: An Ontological Approach to Semantic Interoperability of Metadata}},
  journal   = {AI Magazine},
  volume    = {24},
  number    = {3},
  pages     = {75--92},
  year      = {2003},
  doi       = {10.1609/aimag.v24i3.1720}
}
```

### Time Machine Projects

```bibtex
@article{Kaplan2015-venicetimemachine,
  author    = {Kaplan, Frédéric and di Lenardo, Isabella},
  title     = {{Big Data of the Past}},
  journal   = {Frontiers in Digital Humanities},
  volume    = {4},
  year      = {2017},
  doi       = {10.3389/fdigh.2017.00012},
  note      = {Overview of the Venice Time Machine project methodology}
}
```

```bibtex
@misc{TimeMachineOrg2024,
  author    = {{Time Machine Organisation}},
  title     = {{Time Machine Europe}},
  year      = {2024},
  url       = {https://www.timemachine.eu/},
  note      = {Pan-European initiative for digitizing cultural heritage}
}
```

---

## Technical References

### PostgreSQL & PostGIS

```bibtex
@manual{PostgreSQL2024,
  author    = {{PostgreSQL Global Development Group}},
  title     = {{PostgreSQL 16 Documentation}},
  year      = {2024},
  url       = {https://www.postgresql.org/docs/16/}
}
```

```bibtex
@manual{PostGIS2024,
  author    = {{PostGIS Project Steering Committee}},
  title     = {{PostGIS 3.4 Manual}},
  year      = {2024},
  url       = {https://postgis.net/docs/manual-3.4/}
}
```

### Data Modeling

```bibtex
@book{Hoberman2009,
  author    = {Hoberman, Steve},
  title     = {{Data Modeling Made Simple}},
  edition   = {2nd},
  publisher = {Technics Publications},
  year      = {2009},
  isbn      = {978-0977140060}
}
```

---

## External Data Sources

### Wikidata

```bibtex
@misc{Wikidata2024,
  author    = {{Wikidata contributors}},
  title     = {{Wikidata: A Free Collaborative Knowledge Base}},
  year      = {2024},
  url       = {https://www.wikidata.org/},
  note      = {REST API: https://www.wikidata.org/wiki/Wikidata:REST_API}
}
```

### Suriname Heritage Guide

```bibtex
@misc{SurinameHeritageGuide2024,
  author    = {{Suriname Heritage Guide}},
  title     = {{Suriname Heritage Guide - Historic Panden}},
  year      = {2024},
  url       = {https://www.suriname-heritage-guide.com/},
  note      = {Source for 3D models and historic building documentation}
}
```

---

## How to Add New References

1. Use consistent citation keys: `[AuthorYear]` or `[AuthorYear-keyword]`
2. Include DOI where available
3. Add descriptive notes for context
4. Place in appropriate category section

**Zotero Export:** This file can be imported into Zotero using the BibTeX translator.

---

_Last updated: 2026-01-06_
