# demacro

This module is a wrapper around the CTAN de-macro library for unraveling custom-defined macros in TeX files.

The steps are:

1. Find all occurrences of a macro defined in a `.tex` file & move them into a separate `.sty` file
2. Run `de-macro` on the specific `.tex` file, which will generate a `*-clean.tex` variant of that `.tex` file (as well as any `.tex` dependencies imported)
3. Running `python scripts/process.py compile-tex --arxiv-ids=1906.08632`  step which generates `data/05-compiled-sources/1906.08632`
4. Perform a diff between the PDFs resulting from `-clean.tex` and `.tex`

### questions

- Do we need to point to the "main" `.tex` file?
- Do we need  

