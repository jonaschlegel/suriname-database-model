# Ethical Framework: Working Notes

> Disclaimer: These are not finished guidelines. These are questions I keep coming back to, things I have read, thoughts I have. The "answers" here are provisional.

---

## The uncomfortable starting point

The database is being build up from colonial records. These records exist because of slavery. The death certificates: many of them document enslaved people who were recorded at death because they were property.

---

## What I'm Trying Not to Do

- try to not reproduce colonial categories

  - is this even possible?

- try to not impose false certainty
  - Colonial administrators made mistakes. They guessed ages. They misspelled names. They confused people with similar names.
  - I keep wanting to "clean" the data. Standardise the names. Fill in missing dates. Merge duplicate records.
  - But every "cleaning" decision is an interpretation. If I merge two records because I think they're the same person, I might be wrong. And once merged, that uncertainty disappears.

**Current approach:** Keep the original data separate from interpretations. Let interpretations be explicit, attributed, uncertain.

- do not forget who is missing

  - records are biased towards people the colonial state cared about. Which means in my understanding:
    - Plantation owners: well documented
    - Enslaved people on plantations: documented (as property)
    - Free Black people: sometimes documented
    - Maroons (escaped enslaved people): rarely documented
    - Indigenous people: almost invisible
  - a database build around "what is in the records," is build around colonial priorities, so **how does one show absence?**
    - How to show "there were Maroon communities here, but they do not appear in these records because..."?

- certainty and uncertainty
  - would be good to incoporate as a category in the database
  - four certainty levels for interpretations can be determined (maybe referencing a system here would be good to take that into account, does GLOBALISE work with an approach like that?):
    - **definite**: multiple sources confirm, no reasonable doubt
    - **probable**: strong evidence, most likely interpretation
    - **possible**: plausible but not proven
    - **uncertain**: we really don't know

ToDo:

- [ ] Read literature on uncertainty in historical databases. Start with: Gregory & Ell (2007) on historical GIS https://d1wqtxts1xzle7.cloudfront.net/30991497/item_9780521855631_excerpt-libre.pdf?1392118221=&response-content-disposition=inline%3B+filename%3DHistorical_GIS_Technologies_Methodologie.pdf&Expires=1768232791&Signature=aiUp3OQirJAOCgW5asBnXEQ1TAMq2QDtdLOecAbvEX9ZPm~wvhiyVtL6Tpj1ERSh6euhg7kNICaV2P0PzTvhoKX7fQ3nsg-j7b75RPHPsHctkpfDA3IaI2-SmpI5Rf41p1Eogm5b9guvnQrm36Rh4r0yP4LKDhUph~lhiff8j9e3LchPr5~L39JWF203u0~MBMmoCllnlMmU1BAdBkvdCxD3KZhk38mTdDeMjVkOVyg9SaY5fYu2TlzKHhGAKN9rtHKoMNd6XYFH4Y3ZIS261g~4L8ejCy61~3X5OVG6SaTn9HAJe~kFyxHirEqO8wVNWqIFublN1uTLZ0yeJmgjCg__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA

---

## Schema Implications (Tentative)

What I think we might need to add, but maybe is also too complex in the long run:

1. Multiple names per person, as a person might have a given name, a name given by a plantages owner or others: with name types and sources
2. Interpretation table, where every claim is attributed (see above)
3. Source bias field: noting down what each source can and ca not tell us
4. Content sensitivity flags: for violence, trauma, etc.

Not sure about:

- How to represent "missing" data (absence vs. unknown)
- Whether to have a separate "community/family" entity
- How to handle contested interpretations (scholars disagree about X)

---

## Projects to learn from?

- **Enslaved.org** (https://enslaved.org) - Most directly relevant. They've thought hard about these issues.
- **Freedom on the Move** (https://freedomonthemove.org) - Crowdsourced transcription of runaway ads
- **Slave Voyages** (https://slavevoyages.org) - The big trans-Atlantic trade database
- **UCL Legacies of British Slavery** (https://www.ucl.ac.uk/lbs/) - Compensation records after abolition

---

## Questions I'm Sitting With

- Can a database ever adequately represent a person's life, or is it always a reduction?
- When I make an uncertain interpretation, who bears the risk of being wrong - me, future researchers, or descendants?
- Is it ethical to make this data more accessible, if accessibility enables misuse?
- How do I balance transparency (showing the messy colonial origins of the data) with usability (making the data useful)?
- What would the people in these records want?
