# scholar-reader

An interactive PDF reader, that utilizes Semantic Scholar's data and corpus to provide a novel reading experience to researchers.

This project is being developed in collaboration with UC Berkeley.

More to come soon 🎉.

# Build instructions

The React app is implemented in the `src/` directory. You
can test it standalone by running:

```bash
npm run start
```

The project can be packaged as a Chrome extension. This is
done with `create-react-app`, and Webpack, which compile the
files into a standalone set of pages and scripts that will
be loaded by the Chrome extension when a PDF page is visited
(currently only arXiv).

To compile the files, run:

```bash
npm run build        # compile app with webpack
npm run postbuild    # make small corrections to webpack
                     # files to enable extension
                     # integration.
```

Then you can load the directory for this project as an
"unpacked" extension into Chrome.

## Known Issues

As the PDF gets takes up more and more of the window width,
annotations and text selections eventually get misaligned
with the PDF presentation. Check out [this GitHub
issue](https://github.com/wojtekmaj/react-pdf/issues/332)
for potential fixes.

## Contributors

* [Andrew Head](mailto:andrew.head@berkeley.edu)
* [Kyle Lo](mailto:kylel@allenai.org)
* [Sam Skjonsberg](mailto:sams@allenai.org)
* [Dan Weld](mailto:danw@allenai.org)
* [Marti Hearst](mailto:hearst@berkeley.edu)
