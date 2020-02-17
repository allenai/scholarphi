---
name: Entity Localization
about: Report a problem in localizing entities
title: ''
labels: bug, entity-localization
assignees: ''

---

**Name this issue**

Give this issue a name:

```
Entity Localization Bug: [Entity Type]. [Entity Description] [Problem] in paper [Paper ID]
```

*Example*: For example, if the pipeline fails to detect a citation "(Weld et al. 2010)" in arXiv paper "1811.12889", the name of this issue should be:

```
Entity Localization Bug: Citation. (Weld et al. 2010) not detected in arXiv paper 1811.12889
```

**Assign labels**

Assign this issue two labels, one for each of:
1. The entity type (`citation` or `symbols`)
2. The localization issue type (`missing-entity-detection` or `bad-entity-detection`)

**Describe the bug**

The body of this bug report must include:

_Description_: Describe the issue in 1-2 sentences. Is an entity being mistakenly detected where there is none? Are we failing to detect an entity?

_Screenshot_: A screenshot showing the entity localization issue in the Reader.

_URL (optional)_: A URL to a live version of the Scholar Reader (i.e. an `https://s2-reader.apps.allenai.org` address) where the bug can be seen.

_How to fix (optional)_: If you know how the pipeline or UI can be modified to fix this issue, provide a 1-2 sentence description here.
