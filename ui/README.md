# Scholar Reader Interface

An interactive PDF reader, that utilizes Semantic Scholar's
data and corpus to provide a novel reading experience to
researchers. More to come soon 🎉.

To launch the development version of this server, first install
the dependencies:

```bash
npm install
```

Then you can launch the app as follows:

```bash
PORT=3001 npm start  # 3001 is the port number. Save port 3000
                     # for the development API server.
```

A web browser should open automatically to open the app. You
won't see much interesting at first, as no PDF has been
loaded. Load a PDF by entering the following URL in the URL
bar:
`http://localhost:3001/?file=https://arxiv.org/pdf/0801.4750.pdf`.

You can in theory provide the URL for any PDF as the value
of the `file` query parameter. That said, at the time this
README was written, there was only a few PDFs for which the
augmented reading experience is available.

If you are testing out the application, you should also make
sure that the API server is running on port 3000. See the
README in the `api/` sibling directory for instructions.

The React app is implemented in the `src/` directory.

## PDF.js

We use Mozilla's [PDF.js](https://mozilla.github.io/pdf.js/) for
rendering the PDF.

The contents of `public/` are derived from the PDF.js's "viewer",
which powers the default PDF reading experience in Mozilla Firefox.
The code was built from a [fork](https://github.com/allenai/scholar-reader-pdfjs)
we maintain, with several small edits to accomodate our application.

To build the code, follow these steps:

```bash
git clone git@github.com:allenai/scholar-reader-pdfjs
cd scholar-reader-pdfjs
npm install
npm run build
```

Then, update the files in `public/` with those from the
build:

```bash
mv ~/src/scholar-reader-pdfjs/build/generic/build/* public/build/.
```

The `index.html` file has local edits, and cannot be overwitten
with the upstrema version.
