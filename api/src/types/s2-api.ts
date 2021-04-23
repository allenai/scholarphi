
export interface S2ApiPaper {
  abstract: string;
  arxivId: string | null;
  authors: S2ApiAuthor[];
  doi: string;
  title: string;
  url: string;
  venue: string;
  year: string;
  influentialCitationCount?: number;
  citationVelocity?: number;
  numCiting: number; // outbound citations
  numCitedBy: number; // inbound citations
}

interface S2ApiAuthor {
  authorId: string;
  name: string;
  url: string;
}

export interface S2ApiError {
  error: string;
}

export function isS2ApiError(d: any): d is S2ApiError {
  return !!d.error && typeof d.error === "string";
}
