
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
