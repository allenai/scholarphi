import React from "react";
import { Summary } from "./semanticScholar";

/*
tooltip: {
backgroundColor: theme.palette.common.white,
color: "rgba(0, 0, 0, 0.87)",
boxShadow: theme.shadows[3],
fontFamily: ["Garamond", "Lora", '"Times New Roman"', "serif"].join(","),
fontSize: "12px",
maxWidth: "400px",
paddingLeft: "1rem",
paddingRight: "1rem"
}
*/

interface SummaryProps {
  summary: Summary;
}

export function SummaryView(props: SummaryProps) {
  const authorNamesList = joinAuthorNames(...props.summary.authors);
  return (
    <div className="summary">
      <p>
        <b className="title">{props.summary.title}</b>
      </p>
      {authorNamesList && (
        <p>
          <i className="authors">{authorNamesList}</i>
        </p>
      )}
      <p>{props.summary.abstract}</p>
    </div>
  );
}

function joinAuthorNames(...authors: string[]): string | null {
  if (authors.length === 0) {
    return null;
  } else if (authors.length === 1) {
    return authors[0];
  } else if (authors.length === 2) {
    return authors[0] + " and " + authors[1];
  } else if (authors.length > 2) {
    return authors.slice(0, authors.length - 1).join(", ") + " and " + authors[authors.length - 1];
  }
  return null;
}
