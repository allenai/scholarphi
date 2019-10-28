import axios from "axios";
import { Citation } from "./types/api";

export async function citationsForArxivId(arxivId: string) {
  try {
    const response = await axios.get(`/api/v0/arxiv:${arxivId}/citations`);
    if (response.status === 200) {
      return response.data as Citation[];
    }
    throw Error("Unexpected return value");
  } catch (error) {
    console.error("API Error:", error);
  }
  return [];
}
