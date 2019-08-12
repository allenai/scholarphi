import React from "react";
import { Page } from "react-pdf";
import { PDFPageProxy } from "pdfjs-dist";
import { useState } from "react";
import { CitationAnnotation } from "./CitationAnnotation";
import { Citation, gettSummary as getSummary } from "./citations";
import { Summaries } from "./semanticScholar";

interface AnnotatedPageProps {
  index: number;
  citations: Citation[];
  summaries: Summaries;
}

export function AnnotatedPage(props: AnnotatedPageProps) {
  const [pdfPageProxy, setPdfPageProxy]: [PDFPageProxy | undefined, any] = useState();

  return (
    <Page
      pageNumber={props.index + 1}
      onLoadSuccess={(proxy: PDFPageProxy) => {
        setPdfPageProxy(proxy);
        removeTextLayerOffset();
      }}
    >
      {pdfPageProxy !== undefined &&
        Array.from(new Array(props.citations.length), (_, index) => (
          <CitationAnnotation
            key={`annotation_${index + 1}`}
            x={props.citations[index].x}
            y={props.citations[index].y}
            width={props.citations[index].width}
            height={props.citations[index].height}
            paperSummary={getSummary(props.citations[index], props.summaries) || undefined}
            pageViewport={pdfPageProxy.getViewport({ scale: 1 })}
          />
        ))}
    </Page>
  );
}

/*
 * Fix alignment of text layer with PDF layer. Fix from react-pdf GitHub issue:
 * https://github.com/wojtekmaj/react-pdf/issues/332#issuecomment-458121654
 */
function removeTextLayerOffset() {
  const textLayers = document.querySelectorAll(".react-pdf__Page__textContent");
  textLayers.forEach(layer => {
    if (layer instanceof HTMLElement) {
      const { style } = layer;
      style.top = "0";
      style.left = "0";
      style.transform = "";
    }
  });
}
