# Node scripts for data-processing

Some data processing jobs can be written much more easily in
Node.js code than in Python code. This directory holds those
analysis scripts.

For example, [KaTeX](https://katex.org/) provides a useful
interface for parsing LaTeX equations. However, it is
written as a Node.js package, so it cannot be readily
invoked from Python. So, this directory contains a script
`parse.ts` that parses equations using KaTeX.

Currently, the only script in this directory is the
`parse.ts` command.

To run the code, first install the dependencies:

```bash
npm install
```

Then you can run a command to parse an equation on the
command line like so:

```
npm start equation "x + y"
```

The output will be a
[MathML](https://developer.mozilla.org/en-US/docs/Web/MathML)
representation of the equation, where nodes in the MathML
tree will be annotated with the source positions they
correspond to in the TeX equation wherever possible. It will
be much easier to read the resulting MathML if you format it
using an XML formatter like [this
one](https://www.webtoolkitonline.com/xml-formatter.html).

KaTeX takes a while to load, so if you are parsing many
equations, you should use the batch processing command:

```bash
npm start equations-csv <equations.csv>
```

Where the contents of the CSV file (the `<equations.csv>`
above) should look like:

```csv
"file.tex","0","V"
"file.tex","1","\theta_{ij}"
"file.tex","2","\alpha_{ij}"
"file.tex","3","\theta_{ij}"
```

In this CSV file, the first column is the name of a TeX
equation, the second column is the index of the equation,
and the third column is the TeX for the equation (leave out
the equation delimiters like `$`, `\[`, or
`\begin{equation}`. There should be no header row. The
first two columns are used to output a unique identifier
alongside the MathML for each equation, so you can map the
results to the equations in the CSV file.
