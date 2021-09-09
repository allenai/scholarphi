import queryString from "query-string";
import React from "react";
import ReactDOM from "react-dom";
import ScholarReader from "./ScholarReader";
import { extractArxivId } from './utils/ui';
import { PaperId } from "./state";
import { PDFViewerApplication } from "./types/pdfjs-viewer";
// import * as presetOrders from "./data/presets.json";


// interface Ordering {
//   id: {
//     paper?: string;
//     preset?: string;
//     user?: string;
//   }
// }

// let order = presetOrders as any as Ordering;

require("mathjax-full/es5/core");

/**
 * The global `window` includes several globals we rely upon. This code adds
 * type information so that we can interact with these APIs with type
 * guarantees.
 */
interface HeapAnalyticsClient {
  track: (eventName: string, eventProperties?: object) => void;
}
declare global {
  interface Window {
    PDFViewerApplication?: PDFViewerApplication;
    heap?: HeapAnalyticsClient;
  }
}

const params = queryString.parse(window.location.search);
console.log(params);
let url: string | undefined = undefined;
if (params.file instanceof Array) {
  url = params.file[0];
} else if (typeof params.file === "string") {
  url = params.file;
}

let paperId: PaperId | undefined = undefined;
// added: have an else that runs the pdf anyways
if (url !== undefined) {
  const arxivId = extractArxivId(url);
  if (arxivId !== undefined) {
    paperId = { type: "arxiv", id: arxivId };
  } else {
    paperId = { type: "localfile", id: url };
  }
}

let presets: string[] | undefined = undefined;
if (params.preset instanceof Array) {
  presets = params.preset;
} else if (typeof params.preset === "string") {
  presets = [params.preset];
}

// let presetsOrderKey: string | undefined = undefined;
// if (typeof params.presetOrdersKey === "string") {
//   order = presetOrders[params.presetOrdersKey];
//   presets = [params.preset];
// }

if (params.annotateCitations !== undefined) {
  const element = document.createElement("style");
  document.head.appendChild(element);

  if (element.sheet) {
    element.sheet.insertRule(`
        .citation-annotation { 
            background-color: rgba(0, 0, 255, 0.1) !important; 
        }`,
      0);
  }
}

if (params.annotateSymbols !== undefined) {
  const element = document.createElement("style");
  document.head.appendChild(element);

  if (element.sheet) {
    element.sheet.insertRule(`
        .symbol-annotation { 
            background-color: rgba(255, 0, 0, 0.1) !important; 
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
        }`,
      0);
  }
}

if (params.annotateEquations !== undefined) {
  const element = document.createElement("style");
  document.head.appendChild(element);

  if (element.sheet) {
    element.sheet.insertRule(`
        .equation-annotation { 
            background-color: rgba(0, 255, 0, 0.1) !important; 
        }`,
      0);
  }
}

let context: any = {};
if (typeof params.p === "string") {
  context.userId = params.p;
}

console.log(paperId, presets, context);

ReactDOM.render(
  <ScholarReader paperId={paperId} presets={presets} context={context} />,
  document.querySelector("#scholar-reader")
);
