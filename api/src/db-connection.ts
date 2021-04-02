import * as Knex from "knex";
import {
  BoundingBox,
  Entity,
  EntityCreateData,
  EntityType,
  EntityUpdateData,
  GenericAttributes,
  GenericRelationships,
  isSymbol,
  Paginated,
  PaperIdInfo,
  Relationship,
  SharedSymbolData,
  sharedSymbolFields,
  Symbol
} from "./types/api";
import * as validation from "./types/validation";
import { DBConfig } from "./conf";

/**
 * Create a Knex query builder that can be used to submit queries to the database.
 */
export function createQueryBuilder(params: DBConfig) {
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
  constructor(params: DBConfig) {
    this._knex = createQueryBuilder(params);
  }

  async close() {
    await this._knex.destroy();
  }

  async insertLogEntry(logEntry: LogEntryRow) {
    return await this._knex("logentry").insert(logEntry);
  }

  async getAllPapers(offset: number = 0, size: number = 25, entity_type: EntityType = 'citation'): Promise<Paginated<PaperIdInfo>> {
    type Row = PaperIdInfo & {
      total_count: string;
    }
    const response = await this._knex.raw<{ rows: Row[] }>(`
      SELECT paper.arxiv_id,
             paper.s2_id,
             version.index AS version,
             COUNT(*) OVER() as total_count
        FROM paper
        JOIN ( SELECT MAX(index) AS index,
                      paper_id
                 FROM version
             GROUP BY paper_id ) AS version
          ON version.paper_id = paper.s2_id
        JOIN entity
          ON entity.paper_id = paper.s2_id
         AND entity.version = version.index
         AND entity.type = ?
    GROUP BY paper.s2_id,
             paper.arxiv_id,
             version.index
    ORDER BY paper.arxiv_id DESC
      OFFSET ${offset}
       LIMIT ${size}
    `, [entity_type]);
    const rows = response.rows.map(r => ({
        arxiv_id: r.arxiv_id,
        s2_id: r.s2_id,
        version: r.version,
    }));
    const total = parseInt(response.rows[0].total_count);
    return { rows, offset, size, total };
  }

  async getPaperEntityCount(paperSelector: PaperSelector, entityType: string): Promise<number | null> {
    const idField = isS2Selector(paperSelector) ? 'p.s2_id' : 'p.arxiv_id';
    const idValue = isS2Selector(paperSelector) ? paperSelector.s2_id : `${paperSelector.arxiv_id}%`;
    const whereClause = `${idField} ${isS2Selector(paperSelector) ? '=' : 'ilike'} ?`
    const response = await this._knex.raw<{ rows: {count: number, id: string}[] }>(`
      SELECT count(e.*), ${idField}
      FROM paper p
      JOIN entity e on e.paper_id = p.s2_id
      JOIN (
        SELECT
          paper_id,
          MAX(index) AS max_version
        FROM
          version
        GROUP BY
          paper_id
      ) AS maximum ON maximum.paper_id = e.paper_id
      WHERE e.version = maximum.max_version
      AND ${whereClause}
      AND e.type = ?
      GROUP BY p.s2_id
    `, [idValue, entityType]);
    if (response.rows.length > 0) {
      return response.rows[0].count;
    }
    return null;
  }

  async checkPaper(paperSelector: PaperSelector): Promise<boolean> {
    const rows = await this._knex("paper")
      .where(paperSelector);
    return rows.length > 0;
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
  unpackEntityDataRows(rows: Omit<EntityDataRow, "id">[], slim: boolean = false) {
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
        // optionally return a more compact representation for relationships
        const relationship = slim
          ? { id: row.value }
          : { type: row.relation_type, id: row.value };
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
    entityDataRows: Omit<EntityDataRow, "id">[],
    slim?: boolean,
  ): Entity {
    const boundingBoxes = this.createBoundingBoxes(boundingBoxRows);

    const { attributes, relationships } = this.unpackEntityDataRows(
      entityDataRows, slim
    );

    const entity = {
      id: String(entityRow.id),
      type: entityRow.type as EntityType,
      attributes: {
        ...attributes,
        version: entityRow.version,
        source: entityRow.source,
        bounding_boxes: boundingBoxes,
        tags: attributes.tags || []
      },
      relationships: {
        ...relationships,
      },
    };

    if (isSymbol(entity)) {
      entity.attributes.disambiguated_id = entity.attributes.mathml;
    }

    return entity;
  }

  async getEntitiesForPaper(paperSelector: PaperSelector, entityTypes: EntityType[], includeDuplicateSymbolData: boolean, slim: boolean, version?: number) {
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

    const entityColumns = slim
      ? ["entity.paper_id AS paper_id", "id", "type"]
      : ["entity.paper_id AS paper_id", "id", "version", "type", "source"];
    const entityRows: EntityRow[] = await this._knex("entity")
      .select(entityColumns)
      .join("paper", { "paper.s2_id": "entity.paper_id" })
      .where({ ...paperSelector, version }).andWhere(builder => {
        if (entityTypes.length > 0) {
          builder.whereIn('type', entityTypes);
        } else {
          builder.where(true);
        }
      });

    const entityIds = entityRows.map(e => e.id);

    const boundingBoxColumns = slim
    ? ["id", "entity_id", "page", "left", "top", "width", "height"]
    : ["id", "entity_id", "source", "page", "left", "top", "width", "height"];
    let boundingBoxRows: BoundingBoxRow[];
    try {
      boundingBoxRows = await this._knex("boundingbox")
        .select(boundingBoxColumns)
        .whereIn("entity_id", entityIds);
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
    const entityDataColumns = slim
    ? ["entity.id AS entity_id", "key", "value", "item_type", "of_list", "relation_type"]
    : ["entity.id AS entity_id", "entitydata.source AS source", "key", "value", "item_type", "of_list", "relation_type"];
    const entityDataRows: EntityDataRow[] = await this._knex("entitydata")
      .select(entityDataColumns)
      .join("entity", { "entitydata.entity_id": "entity.id" })
      /*
       * Order by entity ID to ensure that items from lists are retrieved in
       * the order they were written to the database.
       */
      .orderBy("entitydata.id", "asc")
      .whereIn("entity.id", entityIds)
      .whereNot(
        (builder) => {
          if (!includeDuplicateSymbolData) {
            builder
              .where("entity.type", "symbol")
              .whereIn("entitydata.key", sharedSymbolFields)
          }
        }
      )

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
          entityDataRowsForEntity,
          slim
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

  /**
   * Default implementation in `getEntitiesForPaper` naively retrieves all entities,
   * which includes quadratic data duplication across multiple instances of the same symbol.
   * This variant method is meant as a placeholder bridge until the underlying DB schema and
   * extraction write layer is changed to be non-duplicative.
   * Leaving the underlying data unchanged in the DB, we selectively exclude the entity data
   * types known to be redundant. These are retrieved later and added into lookup tables.
   */
  async getDedupedEntitiesForPaper(paperSelector: PaperSelector, entityTypes: EntityType[], version?: number) {
    const entities = await this.getEntitiesForPaper(paperSelector, entityTypes, false, true, version);

    // Short-circuit fancy behavior below if we don't need the shared symbol data.
    if (entityTypes.indexOf("symbol") === -1 && entityTypes.length > 0) {
      return {
        entities
      }
    }

    // To provide a deduped copy of shared data between symbol instances, we
    // identify each symbol by its "disambiguated" id (currently the `mathml` attribute).
    // An arbitrary symbol entity from within each `mathml` is chosen as an exemplar from
    // which to look up supporting data that is identical across instances.
    const disambiguatedSymbolIdsToExemplarEntityIds = entities
      .filter((row) => isSymbol(row))
      .reduce(
        (dict, symbol) => {
          const disambiguatedId = (symbol as Symbol).attributes.mathml;
          if (disambiguatedId !== null) {
            dict[disambiguatedId] = symbol.id;
          }
          return dict;
        },
        {} as {
          [disambiguatedId: string]: string
        }
      );

    const exemplarEntityIdsToDisambiguatedSymbolIds = Object.keys(disambiguatedSymbolIdsToExemplarEntityIds).reduce(
      (dict, key) => {
        const exemplarEntityId = disambiguatedSymbolIdsToExemplarEntityIds[key];
        dict[exemplarEntityId] = key;
        return dict;
      },
      {} as {
        [exemplarEntityId: string]: string
      }
    );

    const dedupedSymbolData = await this._knex("entitydata")
      .select(
        "entity_id",
        "key",
        "value"
      )
      .orderBy("id", "asc")
      .whereIn("key", sharedSymbolFields)
      .whereIn("entity_id", Object.values(disambiguatedSymbolIdsToExemplarEntityIds))

    const sharedSymbolData = dedupedSymbolData.reduce(
      (dict, row) => {
        const disambiguatedId = exemplarEntityIdsToDisambiguatedSymbolIds[row.entity_id];

        if (!(disambiguatedId in dict)) {
          dict[disambiguatedId] = sharedSymbolFields.reduce(
            (dict, key) => {
              dict[key] = [];
              return dict;
            },
            {} as {[sharedSymbolField: string]: string[]}
          );
        }
        dict[disambiguatedId][row.key].push(row.value)

        return dict;
      },
      {} as {
        [disambiguatedId: string]: SharedSymbolData
      }
    )

    return {
      entities,
      sharedSymbolData
    };
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
export type PaperSelector = ArxivIdPaperSelector | S2IdPaperSelector;

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
