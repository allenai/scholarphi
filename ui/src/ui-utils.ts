import React from "react";

export function getMouseXY(event: React.MouseEvent) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

export function isKeypressEscape(event: React.KeyboardEvent | KeyboardEvent) {
  if (
    event.key !== undefined &&
    (event.key === "Esc" || event.key === "Escape")
  ) {
    return true;
  }
  if (event.keyCode !== undefined && event.keyCode === 27) {
    return true;
  }
  return false;
}

const PATTERN_NON_WORD_CHAR = /\W/;
const PATTERN_WORD_CHAR = /\w/;
const ELLIPSIS = '…';

/**
 * Truncates the provided text such that no more than limit characters are rendered and adds an
 * ellipsis upon truncation by default.  If the text is shorter than the provided limit, the full
 * text is returned.
 *
 * This method was ported from Semantic Scholar's UI codebase. It's a UI
 * utility.
 *
 * @param {string} text The text to truncate.
 * @param {number} limit The maximum number of characters to show.
 * @param {boolean} whether to include an ellipsis after the truncation, defaults to true
 *
 * @return {string} the truncated text, or full text if it's shorter than the provided limit.
 */
export function truncateText(text: string, limit: number, withEllipsis: boolean = true): string {
  if (typeof limit !== 'number') {
    throw new Error('limit must be a number');
  }

  if (withEllipsis) {
    limit -= ELLIPSIS.length;
  }

  if (text.length > limit) {
    while (
      limit > 1 &&
      (!PATTERN_WORD_CHAR.test(text[limit - 1]) || !PATTERN_NON_WORD_CHAR.test(text[limit]))
    ) {
      limit -= 1;
    }
    if (limit === 1) {
      return text;
    } else {
      const truncatedText = text.substring(0, limit);
      return withEllipsis ? truncatedText + ELLIPSIS : truncatedText + '.';
    }
  } else {
    return text;
  }
}

/**
 * Get the correct display name for certain publishers.
 * 
 * @param {string} the type of primaryPaperLInk
 */
export function getLinkText(input: string): string {

  var linkText: string = "";

  if (input.length > 17) {
    linkText = "View Via Publisher";
    return linkText;
  }

  switch (input) {
    case "acm":
      linkText = "View On ACM";
      break;
    case "anansi":
      linkText = "View Paper";
      break;
    case "arxiv":
      linkText = "View On ArXiv";
      break;
    case "dblp":
      linkText = "View Paper";
      break;
    case "doi":
      linkText = "View Via Publisher";
      break;
    case "educause":
      linkText = "View On Educause";
      break;
    case "ieee":
      linkText = "View On IEEE";
      break;
    case "institutional":
      linkText = "Check Your Institution";
      break;
    case "medline":
      linkText = "View On PubMed";
      break;
    case "s2":
      linkText = "View Paper";
      break;
    case "wiley":
      linkText = "View Via Publisher";
      break;
    default:
      linkText = "View On " + input;
  }

  if (input === "publisher") {
    linkText = "View via Publisher"
  }

  return linkText;
}