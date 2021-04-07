import axios, { AxiosResponse } from "axios";
import cookie from "cookie";
import { addLibraryEntryUrl, userInfoUrl } from "./s2-url";
import { UserInfo, UserLibrary } from "../state";
import {
  Entity,
  EntityCreateData,
  EntityCreatePayload,
  EntityUpdateData,
  EntityUpdatePayload,
  Paper,
  Paginated,
  PaperIdWithEntityCounts,
  EntityGetResponse,
  Citation,
  Equation,
  Sentence,
  Symbol,
  Term,
} from "./types";
import { Entity as DedupedEntity, DedupedEntityResponse, isCitation, isEquation, isSentence, isSymbol, isTerm, toLegacyRelationship } from "./deduped";

const token = cookie.parse(document.cookie)["readerAdminToken"];

const config = {
  headers: { Authorization: `Bearer ${token}` }
};

export async function listPapers(offset: number = 0, size: number = 25) {
  return axios.get<Paginated<PaperIdWithEntityCounts>>(
    "/api/v0/papers/list",
    { params: { offset, size } }
  );
}

/**
 * API request for paper details need to be batched as it seems that in production,
 * when more than around 50 paper Ids are requested at once, sometimes the API fails to respond.
 * @param s2Ids list of Ids of all the papers cited in this paper
 */
export async function getPapers(s2Ids: string[]) {
  const PAPER_REQUEST_BATCH_SIZE = 50;
  var s2IdsBatch = [];
  var promises = [];

  for (let i = 0; i < s2Ids.length; i += PAPER_REQUEST_BATCH_SIZE) {
    s2IdsBatch.push(s2Ids.slice(i, i + PAPER_REQUEST_BATCH_SIZE));
  }

  for (let i = 0; i < s2IdsBatch.length; i++) {
    promises.push(
      doGet(
        axios.get<Paper[]>("/api/v0/papers", {
          params: {
            id: s2IdsBatch[i].join(","),
          },
        })
      ).then((data: any) => {
        const papers = [];
        if (data !== null && data.data !== undefined) {
          papers.push(...data.data.map((p: any) => p.attributes));
        }
        return papers;
      })
    );
  }

  return Promise.all(promises).then((responses) => responses.flat() as Paper[]);
}

const ENTITY_API_ALL = 'all';
export async function getEntities(arxivId: string, getAllEntities?: boolean) {
  const params = getAllEntities ? {
    type: ENTITY_API_ALL
  } : {};
  const data = await doGet(
    axios.get(`/api/v0/papers/arxiv:${arxivId}/entities`, { params })
  );
  return ((data as any).data || []) as Entity[];
}

// This translates from the entities-deduped API's response to the legacy
// super-duplicated API response, as a compat shim.
// TODO: phase this out in favor of using a more efficient data model in the reader app.
function undedupeResponse(response: DedupedEntityResponse): EntityGetResponse {
  // TODO: Improve error handling; this just pulls the eject handle if the response is an API error
  if (!!(response as any).error) {
    throw "API error: " + (response as any).error;
  }
  const entities: Entity[] = response.entities.map((deduped: DedupedEntity) => {
    if (isCitation(deduped)) {
      const citation: Citation = {
        id: deduped.id,
        type: 'citation',
        attributes: {
          bounding_boxes: deduped.attributes.bounding_boxes,
          paper_id: deduped.attributes.paper_id,
          source: 'tex-pipeline', // hardcoded since most everything comes out of the tex pipeline
          tags: [],
        },
        relationships: {},
      };
      return citation;
    } else if (isEquation(deduped)) {
      const equation: Equation = {
        id: deduped.id,
        type: 'equation',
        attributes: {
          bounding_boxes: deduped.attributes.bounding_boxes,
          source: 'tex-pipeline', // hardcoded since most everything comes out of the tex pipeline
          tags: [],
          tex: deduped.attributes.tex,
        },
        relationships: {},
      };
      return equation;
    } else if (isSentence(deduped)) {
      const sentence: Sentence = {
        id: deduped.id,
        type: 'sentence',
        attributes: {
          bounding_boxes: deduped.attributes.bounding_boxes,
          source: 'tex-pipeline', // hardcoded since most everything comes out of the tex pipeline
          tags: [],
          tex: deduped.attributes.tex,
          tex_start: deduped.attributes.tex_start,
          tex_end: deduped.attributes.tex_end,
          text: deduped.attributes.text,
        },
        relationships: {},
      };
      return sentence;
    } else if (isSymbol(deduped)) {
      const mathml = deduped.attributes.disambiguated_id;
      const symbol: Symbol = {
        id: deduped.id,
        type: 'symbol',
        attributes: {
          bounding_boxes: deduped.attributes.bounding_boxes,
          source: 'tex-pipeline', // hardcoded since most everything comes out of the tex pipeline
          tags: [],
          tex: deduped.attributes.tex,
          type: deduped.attributes.type,
          mathml: deduped.attributes.mathml,
          mathml_near_matches: deduped.attributes.mathml_near_matches,
          diagram_label: deduped.attributes.diagram_label,
          is_definition: deduped.attributes.is_definition,
          nicknames: deduped.attributes.nicknames,
          definitions: response.sharedSymbolData[mathml]?.definitions || [],
          defining_formulas:
            response.sharedSymbolData[mathml]?.defining_formulas || [],
          passages: deduped.attributes.passages,
          snippets: response.sharedSymbolData[mathml]?.snippets || [],
        },
        relationships: {
          equation: toLegacyRelationship(
            deduped.relationships.equation,
            'equation'
          ),
          children: deduped.relationships.children.map(
            (c) => toLegacyRelationship(c, 'symbol')
          ),
          parent: toLegacyRelationship(deduped.relationships.parent, 'symbol'),
          sentence: toLegacyRelationship(
            deduped.relationships.sentence,
            'sentence'
          ),
          nickname_sentences: deduped.relationships.nickname_sentences.map(
            (n) => toLegacyRelationship(n, 'sentence')
          ),
          defining_formula_equations: (
            response.sharedSymbolData[mathml]?.defining_formula_equations || []
          ).map((s) => toLegacyRelationship(s, 'equation')),
          definition_sentences: (
            response.sharedSymbolData[mathml]?.definition_sentences || []
          ).map((s) => toLegacyRelationship(s, 'sentence')),
          snippet_sentences: (
            response.sharedSymbolData[mathml]?.snippet_sentences || []
          ).map((s) => toLegacyRelationship(s, 'sentence')),
        },
      };
      return symbol;
    } else if (isTerm(deduped)) {
      const term: Term = {
        id: deduped.id,
        type: 'term',
        attributes: {
          bounding_boxes: deduped.attributes.bounding_boxes,
          name: deduped.attributes.name,
          source: 'tex-pipeline', // hardcoded since most everything comes out of the tex pipeline
          tags: [],
          term_type: deduped.attributes.term_type,
          definitions: deduped.attributes.definitions,
          definition_texs: deduped.attributes.definition_texs,
          sources: deduped.attributes.sources,
          snippets: deduped.attributes.snippets,
        },
        relationships: {
          sentence: toLegacyRelationship(
            deduped.relationships.sentence,
            'sentence'
          ),
          definition_sentences: (
            deduped.relationships.definition_sentences || []
          ).map((s) => toLegacyRelationship(s, 'sentence')),
          snippet_sentences: (
            deduped.relationships.snippet_sentences || []
          ).map((s) => toLegacyRelationship(s, 'sentence')),
        },
      };
      return term;
    }
    // There's a new kind of entity that hasn't been implemented in the UI.
    throw "Unknown entity type";
  });
  return {
    data: entities,
  };
}


/**
 * This API returns a compacted representation of the paper's entities and their relationships.
 * Certain fields of Symbol entity data are pulled into a separate `sharedSymbolData` map,
 * which is organized by the Symbols' `attributes.disambiguated_id` value.
 *
 * NOTE: Currently, this function passes the response through a transform function to make
 * it compatible with the existing UI code.
 * 
 * @param arxivId arXiv ID of the viewed paper
 * @param getAllEntities `true` retrieves entities of all types, `false` retrieves only citations
 * @returns
 */
export async function getDedupedEntities(arxivId: string, getAllEntities?: boolean) {
  const params = getAllEntities ? {
    type: ENTITY_API_ALL
  } : {};
  const data = await doGet(
    axios.get<EntityGetResponse>(
      `/api/v0/papers/arxiv:${arxivId}/entities-deduped`,
      {
        params,
        //@ts-ignore -- TODO: this pattern works in other projects, is there a version issue somewhere?
        transformResponse: [].concat(axios.defaults.transformResponse).concat(undedupeResponse)
      }
    )
  );
  return data?.data || [];
}

export async function postEntity(
  arxivId: string,
  data: EntityCreateData
): Promise<Entity | null> {
  try {
    const response = await axios.post(
      `/api/v0/papers/arxiv:${arxivId}/entities`,
      { data } as EntityCreatePayload
    );
    if (response.status === 201) {
      return (response.data as any).data as Entity;
    }
  } catch (e) {
    console.error("Unexpected response from API for POST entity request.", e);
  }
  return null;
}

export async function patchEntity(
  arxivId: string,
  data: EntityUpdateData
): Promise<boolean> {
  const response = await axios.patch(
    `/api/v0/papers/arxiv:${arxivId}/entities/${data.id}`,
    { data } as EntityUpdatePayload,
    config
  );
  if (response.status === 204) {
    return true;
  }
  console.error(
    "Unexpected response from API for PATCH entity request.",
    response
  );
  return false;
}

export async function deleteEntity(
  arxivId: string,
  id: string
): Promise<boolean> {
  const response = await axios.delete(
    `/api/v0/papers/arxiv:${arxivId}/entities/${id}`,
    config
  );
  if (response.status === 204) {
    return true;
  }
  console.error(
    "Unexpected response from API for DELETE entity request.",
    response
  );
  return false;
}

export async function addLibraryEntry(paperId: string, paperTitle: string) {
  const folders: number[] = [];
  const response = await axios.post(
    addLibraryEntryUrl,
    {
      paperId,
      paperTitle,
      folders,
    },
    { withCredentials: true }
  );
  return response.data;
}

export async function getUserLibraryInfo() {
  const data = await doGet(
    axios.get<UserInfo>(userInfoUrl, { withCredentials: true })
  );
  if (data) {
    const userLibrary: UserLibrary = {
      paperIds: data.entriesWithPaperIds.map((entry) => entry[1]),
    };
    const email = data.user.email;
    return { email, userLibrary };
  }
}

/**
 * 'get' is a Promise returned by 'axios.get()'
 */
async function doGet<T>(get: Promise<AxiosResponse<T>>) {
  try {
    const response = await get;
    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`API Error: Unexpected response ${response}`);
    }
  } catch (error) {
    console.error("API Error:", error);
  }
  return null;
}
