export type S2ApiResponse = S2ApiError | S2ApiSuccess;

export function isS2ApiResponseSuccess(response: any): response is S2ApiSuccess {
  return response.error === undefined && response.status === 200;
}

interface S2ApiError {
  error: string;
}

interface S2ApiSuccess {
  data: S2ApiPaper;
  status: 200;
}

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
}

interface S2ApiAuthor {
  authorId: string;
  name: string;
  url: string;
}
