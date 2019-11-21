import axios, { AxiosResponse } from "axios";
import { Citation, MathMl, Paper, Symbol } from "./types/api";

export async function citationsForArxivId(arxivId: string) {
  const data = await doGet(
    axios.get(`/api/v0/papers/arxiv:${arxivId}/citations`)
  );
  return (data || []) as Citation[];
}

export async function papers(s2Ids: string[]) {
  const data = await doGet(
    axios.get("/api/v0/papers", {
      params: {
        id: s2Ids.join(",")
      }
    })
  );
  return (data || []) as Paper[];
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

/**
 * 'get' is a Promise returned by 'axios.get()'
 */
async function doGet(get: Promise<AxiosResponse<any>>) {
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
