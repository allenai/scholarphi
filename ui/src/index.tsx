import queryString from "query-string";
import React from "react";
import ReactDOM from "react-dom";
import ScholarReader from "./ScholarReader";
import { extractArxivId } from './utils/ui';
import { PaperId } from "./state";
import { PDFViewerApplication } from "./types/pdfjs-viewer";
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
let url: string | undefined = undefined;
if (params.file instanceof Array) {
  url = params.file[0];
} else if (typeof params.file === "string") {
  url = params.file;
}

let paperId: PaperId | undefined = undefined;
if (url !== undefined) {
  const arxivId = extractArxivId(url);
  if (arxivId !== undefined) {
    paperId = { type: "arxiv", id: arxivId };
  }
}

let presets: string[] | undefined = undefined;
if (params.preset instanceof Array) {
  presets = params.preset;
} else if (typeof params.preset === "string") {
  presets = [params.preset];
}

let context: any = {};
if (typeof params.p === "string") {
  context.userId = params.p;
}

ReactDOM.render(
  <ScholarReader paperId={paperId} presets={presets} context={context} />,
  document.querySelector("#scholar-reader")
);
