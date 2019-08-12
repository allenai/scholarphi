import { Summary } from "./semanticScholar";
import React from "react";
import { Tooltip } from "@material-ui/core";

export const SummaryTooltip = Tooltip;

interface SummaryProps {
  summary: Summary;
}

export function SummaryView(props: SummaryProps) {
  const authorNamesList = joinAuthorNames(...props.summary.authors);
  return <div className="summary">
    <h1 className="title">{props.summary.title}</h1>
    {authorNamesList && <h2 className="authors">{authorNamesList}</h2>}
    <p>{props.summary.abstract}</p>
  </div>
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