import axios, { AxiosRequestConfig } from "axios";
import * as LRU from 'lru-cache';
import { Paper } from "./types/api";
import { S2ApiPaper } from "./types/s2-api";

/**
 * We cache the papers returned from S2's API, since the data doesn't change often and it
 * makes things a lot faster.
 *
 * TODO(@codeviking): The cache size and expiration were arbitrarily set. They should probably be
 * more methodically set at some point.
 */
const cache = new LRU<string, Paper>({
  /* Keep up to 1000. */
  max: 1000,
  /* Expire after 2 hours */
  maxAge: 2 * 60 * 60 * 1000
});

async function getPaperAndSilenceError(s2Id: string, apiKey?: string): Promise<Paper | undefined> {
  try {
    return await getPaper(s2Id, apiKey);
  } catch (err) {
    console.error(`Silentingly handling error fetching Paper ${s2Id} from S2's API: ${err}`);
    return undefined;
  }
}

export async function getPapers(
  s2Ids: string[],
  apiKey: string | undefined = undefined,
  failOnError: boolean = true,
) {
  const results = await Promise.all(s2Ids.map((s2Id) =>
      failOnError ? getPaper(s2Id, apiKey) : getPaperAndSilenceError(s2Id, apiKey)
  ));
  return results.filter((paper) => paper !== undefined);
}

/**
 * Converts the S2 Public API's representation of a paper to our local one.
 */
function toPaper(s2Id: string, apiPaper: S2ApiPaper): Paper {
  const year = parseInt(apiPaper.year) || null;
  const authors = apiPaper.authors.map((a) => ({
    id: a.authorId,
    name: a.name,
    url: a.url,
  }));
  return {
    s2Id,
    authors,
    year,
    title: apiPaper.title,
    abstract: apiPaper.abstract,
    url: apiPaper.url,
    venue: apiPaper.venue,
    citationVelocity: apiPaper.citationVelocity || 0,
    influentialCitationCount: apiPaper.influentialCitationCount || 0,
  };
}

async function getPaper(s2Id: string, apiKey?: string): Promise<Paper | undefined> {
  const cached = cache.get(s2Id);
  if (cached) {
    return Promise.resolve(cached);
  }

  if (!apiKey) {
    console.warn(`
      WARNING: The S2 Public API Key isn't set. If the backend makes more than 100 requests to
      the public API in 5 minutes it'll be rate limited and might stop working.

      See the README.md for more information about geting an API key.
    `);
  }

  const conf: AxiosRequestConfig = {
    headers: {
      'user-agent': 'Semantic Reader API Client (https://scholarphi.semanticscholar.org)'
    }
  };
  if (apiKey) {
    conf.headers['x-api-key'] = apiKey;
  }
  const apiOrigin = (
    apiKey
      ? "https://partner.semanticscholar.org/v1"
      : "https://api.semanticscholar.org/v1"
  );
  const response = await axios.get<S2ApiPaper>(`${apiOrigin}/paper/${s2Id}`, conf);
  const paper = toPaper(s2Id, response.data);
  cache.set(s2Id, paper);

  return paper;
}
