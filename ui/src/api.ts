import axios, { AxiosResponse } from "axios";
import { addLibraryEntryUrl, userInfoUrl } from "./s2-url";
import {
  Annotation,
  AnnotationData,
  AnnotationId,
  Citation,
  MathMl,
  Paper,
  PaperIdWithCounts,
  Symbol,
  UserInfo,
  UserLibrary
} from "./types/api";

export async function citationsForArxivId(arxivId: string) {
  const data = await doGet(
    axios.get(`/api/v0/papers/arxiv:${arxivId}/citations`)
  );
  return (data || []) as Citation[];
}

export async function getAllPapers() {
  return await doGet<PaperIdWithCounts[]>(axios.get("/api/v0/papers/list"));
}

export async function papers(s2Ids: string[]) {
  var promises = collectPromise(s2Ids, 50);
  return Promise.all(promises).then(responses => (responses as Paper[][]).reduce((a, b) => a.concat(b), []));
}

export async function symbolsForArxivId(arxivId: string) {
  const data = await doGet(
    axios.get(`/api/v0/papers/arxiv:${arxivId}/symbols`)
  );
  return (data || []) as Symbol[];
}

export async function mathMlForArxivId(arxivId: string) {
  const data = await doGet(axios.get(`/api/v0/papers/arxiv:${arxivId}/mathml`));
  return (data || []) as MathMl[];
}

export async function annnotationsForArxivId(arxivId: string) {
  const data = await doGet(
    axios.get(`/api/v0/papers/arxiv:${arxivId}/annotations`)
  );
  return (data || []) as Annotation[];
}

export async function postAnnotation(
  arxivId: string,
  annotationData: AnnotationData
): Promise<AnnotationId> {
  const response = await axios.post(
    `/api/v0/papers/arxiv:${arxivId}/annotations`,
    annotationData
  );
  return response.data;
}

export async function putAnnotation(
  arxivId: string,
  id: number,
  annotationData: AnnotationData
) {
  const response = await axios.put(
    `/api/v0/papers/arxiv:${arxivId}/annotation/${id}`,
    annotationData
  );
  return response.data;
}

export async function deleteAnnotation(arxivId: string, id: number) {
  return await axios.delete(`/api/v0/papers/arxiv:${arxivId}/annotation/${id}`);
}

export async function addLibraryEntry(paperId: string, paperTitle: string) {
  const tags: string[] = [];
  const response = await axios.post(
    addLibraryEntryUrl,
    {
      paperId,
      paperTitle,
      tags
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
      paperIds: data.entriesWithPaperIds.map(entry => entry[1])
    };
    return userLibrary;
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

/** 
 * helper function for slicing arrays.
 */
function sliceArray(array: string[], size: number) {
  var result = [];

  for (var i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i+size));
  }

  return result
}

/** 
 * Collect array of promises generated based on array of paper ids.
 */
function collectPromise(papers:string[], size:number) {
  var paperChuck = sliceArray(papers, size);
  var promises = [];

  for (var i = 0; i < paperChuck.length; i++) {
    promises.push(
      doGet(axios.get<Paper[]>("/api/v0/papers", {
        params: {
          id: paperChuck[i].join(",")
        }
      }))
    )
  }

  return promises;
}