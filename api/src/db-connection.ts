import * as Knex from "knex";
import * as nconf from "nconf";
import {
  BoundingBox,
  Citation,
  Entity,
  EntityPatchData as EntityUpdateData,
  EntityPostData as EntityCreateData,
  GenericAttributes,
  GenericEntity,
  GenericRelationships,
  isRelationship,
  PaperWithEntityCounts,
  Relationship,
  Sentence,
  Symbol,
} from "./types/api";

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

  async getAllPapers() {
    const response = await this._knex.raw<{ rows: PaperWithEntityCounts[] }>(`
      SELECT paper.*,
             (
                SELECT COUNT(*)
                  FROM citation
                 WHERE citation.paper_id = paper.s2_id
             ) AS citations,
             (
                SELECT COUNT(*)
                  FROM symbol
                 WHERE symbol.paper_id = paper.s2_id
             ) AS symbols
        FROM paper
    ORDER BY symbols DESC, citations DESC
    `);
    return response.rows
      .filter((row) => parseInt(row.citations) > 0 || parseInt(row.symbols) > 0)
      .map((row) => ({
        s2Id: row.s2_id,
        arxivId: row.arxiv_id,
        extractedCitationCount: parseInt(row.citations),
        extractedSymbolCount: parseInt(row.symbols),
      }));
  }

  async getLatestPaperDataVersion(paperSelector: PaperSelector) {
    const rows = await this._knex("version")
      .max("index")
      .join("paper", { "paper.s2_id": "version.paper_id" })
      .where(paperSelector);
    const version = Number(rows[0].max);
    return isNaN(version) ? null : version;
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
      if (row.type === "scalar") {
        attributes[row.key] = row.value;
      } else if (row.type === "scalar-list") {
        if (row.value !== null) {
          if (attributes[row.key] === undefined) {
            attributes[row.key] = [];
          }
          (attributes[row.key] as string[]).push(row.value);
        }
      } else if (row.type === "reference") {
        relationships[row.key] = { type: row.key, id: row.value };
      } else if (row.type === "reference-list") {
        if (relationships[row.key] === undefined) {
          relationships[row.key] = [];
        }
        (relationships[row.key] as Relationship[]).push({
          type: row.key,
          id: row.value,
        });
      }
    }
    return { attributes, relationships };
  }

  /**
   * Create a symbol entity from loaded entity data. Return 'null' if a symbol couldn't be
   * created from the attributes and relationships provided.
   */
  createSymbol(
    genericEntity: GenericEntity,
    attributes: GenericAttributes,
    relationships: GenericRelationships
  ) {
    if (
      typeof attributes.mathml !== "string" ||
      !Array.isArray(attributes.mathml_near_matches) ||
      !Array.isArray(relationships.children)
    ) {
      throw new EntityLoadError(genericEntity.id, genericEntity.type);
    }
    const mathml = attributes.mathml;
    const mathml_near_matches = attributes.mathml_near_matches;

    let children: Relationship[] = relationships.children.map((c) => ({
      type: "symbol",
      id: c.id,
    }));
    const sentenceId = isRelationship(relationships.sentence)
      ? relationships.sentence.id
      : null;
    const sentence = { type: "sentence", id: sentenceId };

    const symbol: Symbol = {
      ...genericEntity,
      type: "symbol",
      attributes: {
        ...genericEntity.attributes,
        mathml,
        mathml_near_matches,
      },
      relationships: {
        ...genericEntity.relationships,
        children,
        sentence,
      },
    };
    return symbol;
  }

  /**
   * Create a citation entity from loaded entity data. Return 'null' if a citation couldn't be
   * created from the attributes provided.
   */
  createCitation(
    genericEntity: GenericEntity,
    attributes: GenericAttributes,
    _: GenericRelationships
  ) {
    if (typeof attributes.paper_id !== "string") {
      throw new EntityLoadError(genericEntity.id, genericEntity.type);
    }
    const paper_id = attributes.paper_id;

    const citation: Citation = {
      ...genericEntity,
      type: "citation",
      attributes: {
        ...genericEntity.attributes,
        paper_id,
      },
      relationships: genericEntity.relationships,
    };
    return citation;
  }

  /**
   * Create a sentence entity from loaded entity data. Return 'null' if a sentence couldn't be
   * created from the attributes provided.
   */
  createSentence(
    genericEntity: GenericEntity,
    attributes: GenericAttributes,
    _: GenericRelationships
  ) {
    if (
      typeof attributes.text !== "string" ||
      typeof attributes.tex_start !== "string" ||
      typeof attributes.tex_end !== "string"
    ) {
      throw new EntityLoadError(genericEntity.id, genericEntity.type);
    }
    const text = attributes.text;
    const tex_start = parseInt(attributes.tex_start);
    const tex_end = parseInt(attributes.tex_end);

    if (typeof tex_start !== "number" || typeof tex_end !== "number") {
      throw new EntityLoadError(genericEntity.id, genericEntity.type);
    }

    const sentence: Sentence = {
      ...genericEntity,
      type: "sentence",
      attributes: {
        ...genericEntity.attributes,
        text,
        tex_start,
        tex_end,
      },
      relationships: genericEntity.relationships,
    };
    return sentence;
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

    /**
     * Create a basic, bare entity. This entity will be returned if it's not possible to find
     * a known type that has additional attributes and relationships. To avoid leaking
     * junk data to the user, custom attributes and relationships are not added to the
     * basic entity. Known attributes and relationships will be added to known entity types.
     */
    let entity: Entity;
    const genericEntity: GenericEntity = {
      id: String(entityRow.id),
      type: entityRow.type,
      attributes: {
        version: entityRow.version,
        source: entityRow.source,
        bounding_boxes: boundingBoxes,
      },
      relationships: {},
    };

    const { attributes, relationships } = this.unpackEntityDataRows(
      entityDataRows
    );

    /**
     * Attempt to create specialized entity types from the entity data.
     */
    if (entityRow.type === "symbol") {
      entity = this.createSymbol(genericEntity, attributes, relationships);
    } else if (entityRow.type === "citation") {
      entity = this.createCitation(genericEntity, attributes, relationships);
    } else if (entityRow.type === "sentence") {
      entity = this.createSentence(genericEntity, attributes, relationships);
    } else {
      entity = genericEntity;
    }
    return entity;
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
        console.log("Issues getting version number");
      }
    }

    const entityRows: EntityRow[] = await this._knex("entity")
      .select("entity.paper_id AS paper_id", "id", "version", "type", "source")
      .join("paper", { "paper.s2_id": "entity.paper_id" })
      .where({ ...paperSelector, version });

    const boundingBoxRows: BoundingBoxRow[] = await this._knex("boundingbox")
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
        "entitydata.type AS type",
        "key",
        "value"
      )
      .join("entity", { "entitydata.entity_id": "entity.id" })
      .join("paper", { "paper.s2_id": "entity.paper_id" })
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
      .filter((e) => e !== null)
      .map((e) => e as Entity);

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
    const addRow = (
      type: EntityDataRowType,
      key: string,
      value: string | null
    ) => {
      rows.push({
        entity_id,
        source,
        type,
        key,
        value,
      });
    };

    for (const key of Object.keys(attributes)) {
      if (["source", "version", "bounding_boxes"].indexOf(key) !== -1) {
        continue;
      }
      const value = attributes[key];
      if (Array.isArray(value)) {
        for (const v of value) {
          addRow("scalar-list", key, v);
        }
      } else {
        addRow("scalar", key, value);
      }
    }

    for (const relationshipKey of Object.keys(relationships)) {
      const relationshipsValue = relationships[relationshipKey];
      if (Array.isArray(relationshipsValue)) {
        for (const r of relationshipsValue) {
          addRow("reference-list", relationshipKey, r.id);
        }
      } else {
        addRow("scalar", relationshipKey, relationshipsValue.id);
      }
    }

    return rows;
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
      version = this.getLatestPaperDataVersion(paperSelector);
      if (version === undefined) {
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
      version: data.attributes.version,
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
    const entityDataRows = this.createEntityDataRows(
      id,
      data.attributes.source,
      data.attributes,
      data.relationships as GenericRelationships
    );
    await this._knex.batchInsert("boundingbox", boundingBoxRows);
    await this._knex.batchInsert("entitydata", entityDataRows);

    /**
     * Create a sanitized version of the entity to return to the client.
     */
    const cleanedEntity = this.createEntityObjectFromRows(
      { ...entityRow, id },
      boundingBoxRows,
      entityDataRows
    );
    return cleanedEntity;
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
    const attributeRows = this.createEntityDataRows(
      entityId,
      data.attributes.source,
      data.attributes,
      {}
    );
    for (const row of attributeRows) {
      await this._knex("entitydata")
        .delete()
        .where({ entity_id: data.id, type: row.type, key: row.key });
    }
    await this._knex.batchInsert("entitydata", attributeRows);

    /*
     * Update relationships.
     */
    if (data.relationships !== undefined) {
      const relationshipRows = this.createEntityDataRows(
        entityId,
        data.attributes.source,
        {},
        data.relationships as GenericRelationships
      );
      for (const row of relationshipRows) {
        await this._knex("entitydata")
          .delete()
          .where({ entity_id: data.id, type: row.type, key: row.key });
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
