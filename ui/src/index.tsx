// import "antd/dist/antd.css";
import $ from "jquery";
import _ from "lodash";
import queryString from "query-string";
import React from "react";
import ReactDOM from "react-dom";
import { PDFPageView } from "../public/pdf.js/web/pdf_page_view";
import { AnnotatedPage } from "./AnnotatedPage";
import { citations } from "./citations";
import "./index.css";
import { fetchSummaries, Summaries } from "./semanticScholar";
import { PageRenderedEvent, PDFViewerApplication } from "./types/pdfjs-viewer";

declare global {
  interface Window {
    PDFViewerApplication?: PDFViewerApplication;
  }
}

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

let oldPredecessor: JQuery | undefined = undefined;
const pageStamps: { [key: string]: number } = {};
const pgs: { [key: string]: PDFPageView } = {};

function onPDFViewerInitialized(application: PDFViewerApplication) {
  application.eventBus.on("pagerendered", (eventData: PageRenderedEvent) => {
    console.log("rendered", pageStamps);
    const pageNumber = eventData.pageNumber;
    pgs[pageNumber] = eventData.source;
    pageStamps[pageNumber] = eventData.timestamp;

    if (pageNumber === 1) {
      const pageDiv = eventData.source.div;
      if (oldPredecessor !== undefined) {
        oldPredecessor.remove();
      }
      oldPredecessor = $("<div>")
        .width(pageDiv.clientWidth)
        .height(pageDiv.clientHeight)
        .css("background-color", "white")
        .css("margin", "1px auto -8px auto")
        .text("glossary")
        .insertBefore(pageDiv);
    }

    const comp = (
      <div>
        {Object.keys(pageStamps).map(key => {
          return (
            <AnnotatedPage
              key={key + pageStamps[key]}
              index={Number(key)}
              citations={citations(DEFAULT_PDF_URL, Number(key))}
              summaries={summaries}
              page={pgs[key]}
            ></AnnotatedPage>
          );
        })}
      </div>
    );

    const parent = document.querySelector("#phantom");
    if (parent !== null) {
      ReactDOM.render(comp, parent);
    }
  });
}

const CHECK_VIEWER_INITIALIZED_PERIOD_MS = 50;

function checkPDFViewerInitialized() {
  if (window.PDFViewerApplication !== undefined && window.PDFViewerApplication.initialized) {
    onPDFViewerInitialized(window.PDFViewerApplication);
  } else {
    setTimeout(checkPDFViewerInitialized, CHECK_VIEWER_INITIALIZED_PERIOD_MS);
  }
}

checkPDFViewerInitialized();

/*
ReactDOM.render(
  <ScholarReader pdfUrl={url} summaries={summaries} />,
  document.getElementById("root")
);
*/
