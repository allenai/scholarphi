/**
 * Types describing the rows returned by the database. May only partially describe the fields stored
 * in the database. Correspond to schemas in 'data-processing/common/models.py'
 */

interface EntityRow {
  paper_id: string;
  id: string;
  version: number;
  type: string;
  source: string;
}

type EntityRowUpdates = Omit<EntityRow, "id" | "type" | "paper_id">;

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
  type: EntityDataRowType;
  key: string;
  value: string | null;
}

type EntityDataRowType =
  | "scalar"
  | "reference"
  | "scalar-list"
  | "reference-list";
