import $ from "jquery";

const S2_API_BASE_PATH = "https://api.semanticscholar.org/v1";

/**
 * Indexed by titles for now. Later, we may have a better way to map from a citation's information
 * to its abstract. For now, we rely on Grobid to extract a title for each citation, and we use
 * that title to look up abstracts returned from Semantic Scholar.
 */
export interface Summaries {
  [title: string]: Summary;
}

export interface Summary {
  title: string;
  authors: string[];
  abstract: string;
}

/**
 * Fetch summaries for all papers referred to from the paper with arXiv ID 'arxivId'. In the
 * future, this may be extended to any URL for a PDF, or a Semantic Scholar ID.
 */
export function fetchSummaries(
  arxivId: string,
  callback: (summaries: Summaries) => void,
  err?: (reason: any) => void
) {
  const summaries: Summaries = {};
  const paperRequest = $.get(
    S2_API_BASE_PATH + "/paper/arXiv:" + arxivId,
    (data: S2PaperResponse) => {
      Promise.all(
        data.references.map(reference => {
          if (reference.paperId !== undefined) {
            return new Promise(resolve => {
              const referenceRequest = $.get(
                S2_API_BASE_PATH + "/paper/" + reference.paperId,
                (data: S2PaperResponse) => {
                  summaries[reference.title] = {
                    title: reference.title,
                    authors: data.authors.map(a => a.name),
                    abstract: data.abstract
                  };
                  resolve();
                }
              );
              /*
               * Don't report failures to retrieve references information; assume that some will
               * succeed and others will fail.
               */
              referenceRequest.fail(resolve);
            });
          }
        })
      ).then(() => callback(summaries));
    }
  );
  if (err !== undefined) {
    paperRequest.fail(failure => err({ reason: { message: "API request failed", failure } }));
  }
}

/**
 * Partial spec for expected response from S2 API.
 */
interface S2PaperResponse {
  abstract: string;
  authors: Author[];
  references: Reference[];
}

interface Author {
  name: string;
}

interface Reference {
  title: string;
  paperId?: S2PaperId;
}

type S2PaperId = string;
