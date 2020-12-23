# Demo

To produce the demo, do the following:

First, build the app.

```bash
npm run build
```

Then copy over the contents of the `build` directory to the directory where you want to serve the demo.

```bash
scp -r build <username>@<host>:/path/to/project/dir
```

# Changes made to the ScholarPhi source for the demo

* API responses have been inlined (i.e., they don't depend on an external server)
* pdf.js has been directed to load a local PDF without query parameters
* the feature preset for the paper has been set to 'demo'