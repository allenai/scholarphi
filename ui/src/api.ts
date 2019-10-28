import axios from "axios";
import { Citation, Paper } from "./types/api";

export async function citationsForArxivId(arxivId: string) {
  try {
    const response = await axios.get(`/api/v0/papers/arxiv:${arxivId}/citations`);
    if (response.status === 200) {
      return response.data as Citation[];
    }
    throw Error(`API Error: Unexpected response ${response}`);
  } catch (error) {
    console.error("API Error:", error);
  }
  return [];
}

export async function papers(s2Ids: string[]) {
  try {
    const response = await axios.get(`/api/v0/papers`, {
      params: {
        id: s2Ids.join(",")
      }
    });
    if (response.status === 200) {
      return response.data as Paper[];
    }
    throw Error(`API Error: Unexpected response ${response}`);
  } catch (error) {
    console.error("API Error:", error);
  }
  return [];
}
