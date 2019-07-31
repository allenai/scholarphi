'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const path = require('path');
const paths = require('../config/paths');

// Change path to workers to be relative rather than absolute.This lets the app access the worker
// source code, regardless it's run as a server from the build directory, or in an extension.
const mainJsPath = path.join(paths.appBuild, 'static', 'js', 'main.js');

const mainJsText =  fs.readFileSync(mainJsPath, 'utf8');
const updatedMainJsText = mainJsText.replace(/new Worker\(r\.p\+/g, "new Worker(");
fs.writeFileSync(mainJsPath, updatedMainJsText, 'utf8');
