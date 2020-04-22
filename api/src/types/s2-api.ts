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

export interface S2Api {
  paper: S2ApiPaper;
}

interface S2ApiPaper {
  id: string;
  title: S2ApiTitle;
  paperAbstract: S2ApiAbstract;
  authors: S2ApiAuthor[][];
  year: S2ApiYear;
  venue: S2ApiVenue;
  primaryPaperLink: S2ApiPaperLink;
  doiInfo: S2ApiDoi;
  citationStats: S2ApiCitationStats;
}

export interface S2ApiTitle {
  text: string;
}

interface S2ApiAbstract {
  text: string;
}

interface S2ApiYear {
  text: string;
}

interface S2ApiVenue {
  text: string;
}

interface S2ApiPaperLink {
  url: string;
}

interface S2ApiDoi {
  doi: string;
}

interface S2ApiCitationStats {
  citationVelocity: number;
  numKeyCitations: number;
}

interface S2ApiAuthor {
  ids: string;
  name: string;
}
