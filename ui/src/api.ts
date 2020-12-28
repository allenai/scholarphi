import axios, { AxiosResponse } from "axios";
import {
  Entity,
  EntityCreateData,
  EntityUpdateData,
  Paginated,
  PaperIdWithEntityCounts,
} from "./types/api";

export async function listPapers(offset: number = 0, size: number = 25) {
  return await doGet<Paginated<PaperIdWithEntityCounts>>(
    axios.get("/api/v0/papers/list", { params: { offset, size } })
  );
}

/**
 * API request for paper details need to be batched as it seems that in production,
 * when more than around 50 paper Ids are requested at once, sometimes the API fails to respond.
 * @param s2Ids list of Ids of all the papers cited in this paper
 */
export async function getPapers(s2Ids: string[]) {
  return [];
}

export async function getEntities(arxivId: string) {
  return [];
}

export async function postEntity(
  arxivId: string,
  data: EntityCreateData
): Promise<Entity | null> {
  return null;
}

export async function patchEntity(
  arxivId: string,
  data: EntityUpdateData
): Promise<boolean> {
  return false;
}

export async function deleteEntity(
  arxivId: string,
  id: string
): Promise<boolean> {
  return false;
}

export async function addLibraryEntry(paperId: string, paperTitle: string) {
  return null;
}

export async function getUserLibraryInfo() {
  return null;
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
