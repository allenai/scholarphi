# Scholar Reader Interface

An interactive PDF reader, that utilizes Semantic Scholar's
data and corpus to provide a novel reading experience to
researchers. More to come soon 🎉.

## Prerequisites

* Install [NodeJS](https://nodejs.org/en/).

## Getting Started

To launch the development version of this server, first
install the dependencies by running:

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
loaded. Load a PDF by visiting [this URL](http://localhost:3001/?file=https://arxiv.org/pdf/0801.4750.pdf).

You can in theory provide the URL for any PDF as the value
of the `file` query parameter. That said, at the time this
README was written, there was only a few PDFs for which the
augmented reading experience is available.

## Architecture

We leverage [Mozilla's PDF.js](https://mozilla.github.io/pdf.js/)
for rendering the PDF in a browser. We maintain a [fork](https://github.com/allenai/scholar-reader-pdfjs)
with several changes specific to our application.  The fork is
linked to the code as a submodule.

The code in `public/` is produced from our fork, and serves
as a base into which our additional interface elements are
rendered. You can regenerate this code and overwrite the copies
in `public/` by executing these commands:

```
git submodule init
git submodule update
bash bin/build_pdf.js.sh
```

Of note, make sure you restore the HEAP analytics tracking snippet
after regenerating `viewer.html`. It should be easy to identify in the
resulting `git diff`.

The code for the enhancements we add to the PDF is present in
`src/`. We've elected to use [TypeScript](https://www.typescriptlang.org)
and [React](https://reactjs.org/) for writing the interface.

## Using a Local API

By default the UI proxies API requests to the production
API (https://s2-reader.apps.allenai.org). This makes it possible
to run a self-standing version of the UI locally.

To use a local version of the API, export the `PROXY` environment
variable like so:

```bash
export PROXY='http://localhost:3000'
```

See the README in the `api/` sibling directory for more information
about running it locally.
