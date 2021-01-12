/**
 * Types describing the rows returned by the database. May only partially describe the fields stored
 * in the database. Correspond to schemas in 'data-processing/common/models.py'
 */

export interface PaperRow {
  s2_id: string;
  arxiv_id: string;
}

export interface VersionRow {
  id: number;
  paper_id: string;
  index: number;
}

export interface EntityRow {
  paper_id: string;
  id: number;
  version: number;
  type: string;
  source: string;
}

export type EntityRowUpdates = Omit<EntityRow, "id" | "type" | "paper_id">;

export interface BoundingBoxRow {
  id: number;
  entity_id: number;
  source: string;
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface EntityDataRow {
  id: number;
  entity_id: number;
  source: string;
  key: string;
  value: string | null;
  item_type: EntityDataRowType;
  of_list: boolean;
  relation_type: string | null;
}

export type EntityDataRowType =
  | "boolean"
  | "integer"
  | "float"
  | "string"
  | "relation-id";

export interface LogEntryRow {
  ip_address: string;
  username: string | null;
  level: string;
  event_type: string | null;
  data: any;
}
