import * as Knex from "knex";
import * as nconf from "nconf";
import {
  BoundingBox,
  Entity,
  EntityCreateData,
  EntityUpdateData,
  GenericAttributes,
  GenericRelationships,
  PaperWithEntityCounts,
  Relationship,
} from "./types/api";
import * as validation from "./types/validation";

/**
 * Extract connection parameters from the application-wide configuration.
 */
export function extractConnectionParams(
  config: nconf.Provider
): ConnectionParams {
  return config.get("database");
}

interface ConnectionParams {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema?: string;
}

/**
 * Create a Knex query builder that can be used to submit queries to the database.
 */
export function createQueryBuilder(params: ConnectionParams) {
  const { host, port, database, user, password } = params;
  const config: Knex.Config = {
    client: "pg",
    connection: { host, port, database, user, password },
    pool: { min: 0, max: 10, idleTimeoutMillis: 500 },
  };
  if (params.schema) {
    config.searchPath = [params.schema];
  }
  return Knex(config);
}

/**
 * An error in loading data for an entity from the API. Based on custom error class declaration from:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 */
export class EntityLoadError extends Error {
  constructor(id: string, type: string, ...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EntityLoadError);
    }
    this.name = "ValidationError";
    this.message = `Data for entity ${id} of type ${type} is either missing or typed incorrectly`;
  }
}

/**
 * An interface to the database. Performs queries and returns santized, typed objects.
 */
export class Connection {
  constructor(params: ConnectionParams) {
    this._knex = createQueryBuilder(params);
  }

  async close() {
    await this._knex.destroy();
  }

  async insertLogEntry(logEntry: LogEntryRow) {
    return await this._knex("logentry").insert(logEntry);
  }

  async getAllPapers() {
    const response = await this._knex.raw<{ rows: PaperWithEntityCounts[] }>(`
        WITH version AS (SELECT MAX(version) AS latest FROM entity)
      SELECT paper.*,
             (
                SELECT COUNT(*)
                  FROM entity
                 WHERE entity.paper_id = paper.s2_id
                   AND type = 'citation'
                   AND version = (SELECT latest FROM version)
             ) AS citations,
             (
                SELECT COUNT(*)
                  FROM entity
                 WHERE entity.paper_id = paper.s2_id
                   AND type = 'symbol'
                   AND version = (SELECT latest FROM version)
             ) AS symbols
        FROM paper
    ORDER BY symbols DESC, citations DESC
    `);
    return response.rows
      .map((row) => ({
        s2Id: row.s2_id,
        arxivId: row.arxiv_id,
        extractedCitationCount: parseInt(row.citations),
        extractedSymbolCount: parseInt(row.symbols),
      }));
  }

  async getLatestPaperDataVersion(paperSelector: PaperSelector): Promise<number | null> {
    const rows = await this._knex("version")
      .max("index")
      .join("paper", { "paper.s2_id": "version.paper_id" })
      .where(paperSelector);
    const version = Number(rows[0].max);
    return isNaN(version) ? null : version;
  }

  async getLatestProcessedArxivVersion(paperSelector: PaperSelector): Promise<number | null> {
    if (isS2Selector(paperSelector)) {
      return null;
    }
    // Provided arXiv IDs might have a version suffix, but ignore that for this check.
    const versionDelimiterIndex = paperSelector.arxiv_id.indexOf('v');
    const arxivId = versionDelimiterIndex > -1 ? paperSelector.arxiv_id.substring(0, versionDelimiterIndex) : paperSelector.arxiv_id;

    // TODO(mjlangan): This won't support arXiv IDs prior to 03/2007 as written
    const response = await this._knex.raw<{ rows: { arxiv_version: number }[] }>(`
      SELECT CAST((REGEXP_MATCHES(arxiv_id,'^\\d{4}\\.\\d{4,5}v(\\d+)$'))[1] AS integer) AS arxiv_version
        FROM paper
        WHERE arxiv_id ilike ?
        ORDER BY arxiv_version DESC
        LIMIT 1
    `, [`${arxivId}%`]);

    if (response.rows.length > 0) {
      return response.rows[0].arxiv_version;
    }

    return null;
  }

  createBoundingBoxes(
    boundingBoxRows: Omit<BoundingBoxRow, "id">[]
  ): BoundingBox[] {
    return boundingBoxRows.map((bbr) => ({
      source: bbr.source,
      page: bbr.page,
      left: bbr.left,
      top: bbr.top,
      width: bbr.width,
      height: bbr.height,
    }));
  }

  /**
   * Extract attributes and relationships for an entity from database rows. These attributes and
   * relationships may need to be cleaned, as they contain *anything* that was found in the
   * entity table, which could include junk uploaded by annotators.
   */
  unpackEntityDataRows(rows: Omit<EntityDataRow, "id">[]) {
    const attributes: GenericAttributes = {};
    const relationships: GenericRelationships = {};
    for (const row of rows) {
      /**
       * Read attributes.
       */
      let casted_value;
      if (row.value === null) {
        if (!row.of_list) {
          casted_value = null;
        }
      } else if (row.item_type === "integer") {
        casted_value = parseInt(row.value);
      } else if (row.item_type === "float") {
        casted_value = parseFloat(row.value);
      } else if (row.item_type === "string") {
        casted_value = row.value;
      }
      if (casted_value !== undefined) {
        if (row.of_list) {
          if (attributes[row.key] === undefined) {
            attributes[row.key] = [];
          }
          attributes[row.key].push(casted_value);
        } else {
          attributes[row.key] = casted_value;
        }
      }

      /**
       * Read relationships.
       */
      if (row.item_type === "relation-id" && row.relation_type !== null) {
        const relationship = { type: row.relation_type, id: row.value };
        if (row.of_list) {
          if (relationships[row.key] === undefined) {
            relationships[row.key] = [];
          }
          (relationships[row.key] as Relationship[]).push(relationship);
        } else {
          relationships[row.key] = relationship;
        }
      }
    }
    return { attributes, relationships };
  }

  /**
   * Convert entity information from the database into an entity object.
   */
  createEntityObjectFromRows(
    entityRow: EntityRow,
    boundingBoxRows: Omit<BoundingBoxRow, "id">[],
    entityDataRows: Omit<EntityDataRow, "id">[]
  ): Entity {
    const boundingBoxes = this.createBoundingBoxes(boundingBoxRows);

    const { attributes, relationships } = this.unpackEntityDataRows(
      entityDataRows
    );

    return {
      id: String(entityRow.id),
      type: entityRow.type,
      attributes: {
        ...attributes,
        version: entityRow.version,
        source: entityRow.source,
        bounding_boxes: boundingBoxes,
      },
      relationships: {
        ...relationships,
      },
    };
  }

  async getEntitiesForPaper(paperSelector: PaperSelector, version?: number) {
    if (version === undefined) {
      try {
        let latestVersion = await this.getLatestPaperDataVersion(paperSelector);
        if (latestVersion === null) {
          return [];
        }
        version = latestVersion;
      } catch (e) {
        console.log("Error fetching latest data version number:", e);
      }
    }

    const entityRows: EntityRow[] = await this._knex("entity")
      .select("entity.paper_id AS paper_id", "id", "version", "type", "source")
      .join("paper", { "paper.s2_id": "entity.paper_id" })
      .where({ ...paperSelector, version });

    let boundingBoxRows: BoundingBoxRow[];
    try {
      boundingBoxRows = await this._knex("boundingbox")
        .select(
          "entity.id AS entity_id",
          "boundingbox.id AS id",
          "boundingbox.source AS source",
          "page",
          "left",
          "top",
          "width",
          "height"
        )
        .join("entity", { "boundingbox.entity_id": "entity.id" })
        .join("paper", { "paper.s2_id": "entity.paper_id" })
        .where({ ...paperSelector, version });
    } catch (e) {
      console.log(e);
      throw "Error";
    }

    /*
     * Organize bounding box data by the entity they belong to.
     */
    const boundingBoxRowsByEntity = boundingBoxRows.reduce(
      (dict, row) => {
        if (dict[row.entity_id] === undefined) {
          dict[row.entity_id] = [];
        }
        dict[row.entity_id].push(row);
        return dict;
      },
      {} as {
        [entity_id: string]: BoundingBoxRow[];
      }
    );

    const entityDataRows: EntityDataRow[] = await this._knex("entitydata")
      .select(
        "entity.id AS entity_id",
        "entitydata.source AS source",
        "key",
        "value",
        "item_type",
        "of_list",
        "relation_type"
      )
      .join("entity", { "entitydata.entity_id": "entity.id" })
      .join("paper", { "paper.s2_id": "entity.paper_id" })
      /*
       * Order by entity ID to ensure that items from lists are retrieved in
       * the order they were written to the database.
       */
      .orderBy("entitydata.id", "asc")
      .where({ ...paperSelector, version });

    /*
     * Organize entity data entries by the entity they belong to.
     */
    const entityDataRowsByEntity = entityDataRows.reduce(
      (dict, row) => {
        if (dict[row.entity_id] === undefined) {
          dict[row.entity_id] = [];
        }
        dict[row.entity_id].push(row);
        return dict;
      },
      {} as {
        [entity_id: string]: EntityDataRow[];
      }
    );

    /**
     * Create entities from entity data.
     */
    const entities: Entity[] = entityRows
      .map((entityRow) => {
        const boundingBoxRowsForEntity =
          boundingBoxRowsByEntity[entityRow.id] || [];
        const entityDataRowsForEntity =
          entityDataRowsByEntity[entityRow.id] || [];
        return this.createEntityObjectFromRows(
          entityRow,
          boundingBoxRowsForEntity,
          entityDataRowsForEntity
        );
      })
      /*
       * Validation with Joi does two things:
       * 1. It adds default values to fields for an entity.
       * 2. It lists errors when an entity is still missing reuqired properties.
       */
      .map((e) => validation.loadedEntity.validate(e, { stripUnknown: true }))
      .filter((validationResult) => {
        if (validationResult.error !== undefined) {
          console.error(
            "Invalid entity will not be returned. Error:",
            validationResult.error
          );
          return false;
        }
        return true;
      })
      .map((validationResult) => validationResult.value as Entity);

    return entities;
  }

  createBoundingBoxRows(
    entity_id: number,
    bounding_boxes: BoundingBox[]
  ): Omit<BoundingBoxRow, "id">[] {
    return bounding_boxes.map((bb) => ({
      entity_id,
      source: bb.source,
      page: bb.page,
      left: bb.left,
      top: bb.top,
      width: bb.width,
      height: bb.height,
    }));
  }

  /**
   * Take an input entity and extract from it a list of rows that can be inserted into the
   * 'entitydata' table to preserve all that's worth knowing about this entity. It is expected that
   * if an entity has undergone the validation from the './validation.ts' validators, then all
   * attributes and relationships are valid and therefore will be entered in the database.
   */
  createEntityDataRows(
    entity_id: number,
    source: string,
    attributes: GenericAttributes,
    relationships: GenericRelationships
  ) {
    const rows: Omit<EntityDataRow, "id">[] = [];
    const keys = [];

    const addRow = (
      key: string,
      value: string | null,
      item_type: EntityDataRowType,
      of_list: boolean,
      relation_type?: string | null
    ) => {
      rows.push({
        entity_id,
        source,
        key,
        value,
        item_type,
        of_list,
        relation_type: relation_type || null,
      });
    };

    for (const key of Object.keys(attributes)) {
      if (["source", "version", "bounding_boxes"].indexOf(key) !== -1) {
        continue;
      }
      if (keys.indexOf(key) === -1) {
        keys.push(key);
      }
      const value = attributes[key];
      let values = [];
      let of_list;
      if (Array.isArray(value)) {
        values = value;
        of_list = true;
      } else {
        values = [value];
        of_list = false;
      }
      for (let v of values) {
        let item_type: EntityDataRowType | undefined = undefined;
        if (typeof v === "boolean") {
          item_type = "boolean";
          v = v ? 1 : 0;
        } else if (typeof v === "number") {
          /**
           * This check for whether a number is an integer is based on the polyfill from MDN:
           * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
           */
          if (isFinite(v) && Math.floor(v) === v) {
            item_type = "integer";
          } else {
            item_type = "float";
          }
        } else if (typeof v === "string") {
          item_type = "string";
        }
        if (item_type !== undefined) {
          addRow(key, String(v), item_type, of_list, null);
        }
      }
    }

    for (const key of Object.keys(relationships)) {
      if (keys.indexOf(key) === -1) {
        keys.push(key);
      }
      const value = relationships[key];
      if (Array.isArray(value)) {
        for (const r of value) {
          addRow(key, r.id, "relation-id", true, r.type);
        }
      } else {
        addRow(key, value.id, "relation-id", false, value.type);
      }
    }

    return { rows, keys };
  }

  async createEntity(paperSelector: PaperSelector, data: EntityCreateData) {
    /**
     * Fetch the ID for the specified paper.
     */
    const paperRows = await this._knex("paper")
      .select("s2_id AS id")
      .where(paperSelector);
    const paperId = paperRows[0].id;

    /**
     * Create entity with the most recent data version for this paper if the data version was
     * not specified by the client.
     */
    let version;
    if (typeof data.attributes.version === "number") {
      version = data.attributes.version;
    } else {
      version = await this.getLatestPaperDataVersion(paperSelector);
      if (version === null) {
        throw Error(
          "No data version was specified, and no data version exists for this paper."
        );
      }
    }

    /**
     * Create new entity.
     */
    const entityRow: Omit<EntityRow, "id"> = {
      paper_id: paperId,
      type: data.type,
      version,
      source: data.attributes.source,
    };
    const id = Number(
      (await this._knex("entity").insert(entityRow).returning("id"))[0]
    );

    /**
     * Insert bounding boxes and data for entity. Must occur after the entity is inserted in
     * order to have access to the entity ID.
     */
    const boundingBoxRows = this.createBoundingBoxRows(
      id,
      data.attributes.bounding_boxes
    );
    const { rows: entityDataRows } = this.createEntityDataRows(
      id,
      data.attributes.source,
      data.attributes,
      data.relationships as GenericRelationships
    );
    await this._knex.batchInsert("boundingbox", boundingBoxRows);
    await this._knex.batchInsert("entitydata", entityDataRows);

    /**
     * Create a completed version of the entity to return to the client.
     */
    return {
      ...data,
      id: String(id),
      attributes: {
        ...data.attributes,
        version,
      },
    };
  }

  async updateEntity(data: EntityUpdateData) {
    /**
     * Update entity data.
     */
    let entityRowUpdates: EntityRowUpdates | null = null;
    if (data.attributes !== undefined) {
      entityRowUpdates = {
        source: data.attributes.source,
        version: data.attributes.version,
      };
    }
    if (entityRowUpdates !== null && Object.keys(entityRowUpdates).length > 0) {
      await this._knex("entity")
        .update(entityRowUpdates)
        .where({ id: data.id, type: data.type });
    }
    const entityId = Number(data.id);

    /*
     * Update bounding boxes.
     */
    if (data.attributes.bounding_boxes !== undefined) {
      await this._knex("boundingbox").delete().where({ entity_id: data.id });
      const boundingBoxRows = this.createBoundingBoxRows(
        entityId,
        data.attributes.bounding_boxes
      );
      await this._knex.batchInsert("boundingbox", boundingBoxRows);
    }

    /*
     * Update custom attributes, by removing previous values for known attributes and updating
     * them to the new values.
     */
    const {
      rows: attributeRows,
      keys: attributeKeys,
    } = this.createEntityDataRows(
      entityId,
      data.attributes.source,
      data.attributes,
      {}
    );
    for (const key of attributeKeys) {
      await this._knex("entitydata")
        .delete()
        .where({ entity_id: data.id, key });
    }
    await this._knex.batchInsert("entitydata", attributeRows);

    /*
     * Update relationships.
     */
    if (data.relationships !== undefined) {
      const {
        keys: relationshipKeys,
        rows: relationshipRows,
      } = this.createEntityDataRows(
        entityId,
        data.attributes.source,
        {},
        data.relationships as GenericRelationships
      );
      for (const key of relationshipKeys) {
        await this._knex("entitydata")
          .delete()
          .where({ entity_id: data.id, key });
      }
      await this._knex.batchInsert("entitydata", relationshipRows);
    }
  }

  async deleteEntity(entity_id: string) {
    await this._knex("entity").delete().where({ id: entity_id });
  }

  private _knex: Knex;
}

/**
 * Expected knex.js parameters for selecting a paper. Map from paper table column ID to value.
 */
type PaperSelector = ArxivIdPaperSelector | S2IdPaperSelector;

interface ArxivIdPaperSelector {
  arxiv_id: string;
}

interface S2IdPaperSelector {
  s2_id: string;
}

function isArxivSelector(selector: PaperSelector): selector is ArxivIdPaperSelector {
  return (selector as ArxivIdPaperSelector).arxiv_id !== undefined;
}

function isS2Selector(selector: PaperSelector): selector is S2IdPaperSelector {
  return (selector as S2IdPaperSelector).s2_id !== undefined;
}
