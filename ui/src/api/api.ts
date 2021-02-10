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
} from "./types";

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

export async function getEntities(arxivId: string) {
  const data = await doGet(
    axios.get(`/api/v0/papers/arxiv:${arxivId}/entities`)
  );
  return ((data as any).data || []) as Entity[];
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
