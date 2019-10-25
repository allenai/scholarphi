import _ from "lodash";
import * as queryString from "query-string";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import ScholarReader from "./ScholarReader";
import { fetchSummaries, Summaries } from "./semanticScholar";
import * as serviceWorker from "./serviceWorker";

// var DEFAULT_PDF_URL = "https://arxiv.org/pdf/1907.09807.pdf"  // Deep learning for programming languages paper
var DEFAULT_PDF_URL = "https://arxiv.org/pdf/1907.07355.pdf";

var params = queryString.parse(window.location.search);
var url;
if (params.url instanceof Array) {
  url = params.url[0];
} else if (params.url == null) {
  url = DEFAULT_PDF_URL;
} else {
  url = params.url;
}

/**
 * List of paper summaries, to be populated asynchronously.
 */
const summaries: Summaries = {};

/**
 * TODO(andrewhead): Handle the case of arXiv publications that have multiple versions. How do we
 * make sure we're querying for the same version of paper data as the paper that was opened?
 */
function extractArxivId(url: string): string | undefined {
  const matches = url.match(/arxiv\.org\/pdf\/(.*?)(?:\.pdf)?$/) || [];
  return matches[1];
}

const arxivId = extractArxivId(url);
if (arxivId !== undefined) {
  fetchSummaries(arxivId, (fetchedSummaries: Summaries) => {
    _.merge(summaries, fetchedSummaries);
  });
}

ReactDOM.render(
  <ScholarReader pdfUrl={url} summaries={summaries} />,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
