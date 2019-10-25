import React from "react";
import { PDFPageView } from "../public/pdf.js/web/pdf_page_view";
import { CitationAnnotation } from "./CitationAnnotation";
import { Citation } from "./citations";
import { Summaries } from "./semanticScholar";

interface AnnotatedPageProps {
  index: number;
  citations: Citation[];
  page: PDFPageView;
  summaries: Summaries;
}

export function AnnotatedPage(props: AnnotatedPageProps) {
  console.log(props.citations);

  const page = props.page;

  return (
    <div>
      {Array.from(new Array(props.citations.length), (_, index) => (
        <CitationAnnotation
          key={`annotation_${index + 1}`}
          x={props.citations[index].x}
          y={props.citations[index].y}
          width={props.citations[index].width}
          height={props.citations[index].height}
          paperSummary={undefined}
          canvas={page.canvas}
          page={page}
          // paperSummary={getSummary(props.citations[index], props.summaries) || undefined}
          /* Why in the world do we need this scaling factor of 4/3??? */
          pageViewport={page.pdfPage.getViewport({ scale: (page.scale * 4) / 3 })}
        />
      ))}
    </div>
  );
}
