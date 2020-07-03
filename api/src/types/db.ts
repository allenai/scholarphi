/**
 * Types describing the rows returned by the database. May only partially describe the fields stored
 * in the database. Correspond to schemas in 'data-processing/common/models.py'
 */

interface EntityRow {
  id: string;
  version: number;
  type: string;
  source: string;
}

interface BoundingBoxRow {
  entity_id: string;
  source: string;
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface EntityDataRow {
  entity_id: string;
  source: string;
  type: "scalar" | "reference" | "scalar-list" | "reference-list";
  key: string;
  value: string;
}

type EntityDataRowType =
  | "scalar"
  | "reference"
  | "scalar-list"
  | "reference-list";
