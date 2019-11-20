import queryString from "query-string";
import React from "react";
import ReactDOM from "react-dom";
import ScholarReader from "./ScholarReader";
import { PaperId } from "./state";
import { PDFViewerApplication } from "./types/pdfjs-viewer";
require("mathjax-full/es5/core");

declare global {
  interface Window {
    PDFViewerApplication?: PDFViewerApplication;
  }
}

/**
 * TODO(andrewhead): Handle the case of arXiv publications that have multiple versions. How do we
 * make sure we're querying for the same version of paper data as the paper that was opened?
 */
function extractArxivId(url: string): string | undefined {
  const matches = url.match(/arxiv\.org\/pdf\/(.*?)(?:\.pdf)?$/) || [];
  return matches[1];
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

ReactDOM.render(
  <ScholarReader paperId={paperId} />,
  document.querySelector("#scholar-reader")
);
