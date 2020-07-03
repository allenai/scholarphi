import * as Knex from "knex";
import * as nconf from "nconf";
import {
  BoundingBox,
  Citation,
  Entity,
  GenericAttributes,
  GenericEntity,
  GenericRelationships,
  isRelationship,
  PaperWithEntityCounts,
  Relationship,
  Sentence,
  Symbol,
} from "./types/response";

export class Connection {
  constructor(config: nconf.Provider) {
    this._knex = Knex({
      client: "pg",
      connection: {
        host: config.get("database:host"),
        port: config.get("database:port"),
        user: config.get("database:user"),
        password: config.get("database:password"),
        database: config.get("database:database"),
        ssl: true,
      },
      searchPath: [config.get("database:schema")],
    });
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

  async getLatestPaperDataVersion(paperSelector: PaperSelector) {}

  createBoundingBoxes(boundingBoxRows: BoundingBoxRow[]): BoundingBox[] {
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
  unpackEntityDataRows(rows: EntityDataRow[]) {
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
        if (relationships[row.type] === undefined) {
          relationships[row.type] = [];
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
      return null;
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
      return null;
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
      return null;
    }
    const text = attributes.text;
    const tex_start = parseInt(attributes.tex_start);
    const tex_end = parseInt(attributes.tex_end);

    if (typeof tex_start !== "number" || typeof tex_end !== "number") {
      return null;
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
  createEntity(
    entityRow: EntityRow,
    boundingBoxRows: BoundingBoxRow[],
    entityDataRows: EntityDataRow[]
  ): Entity | null {
    const boundingBoxes = this.createBoundingBoxes(boundingBoxRows);

    /**
     * Create a basic, bare entity. This entity will be returned if it's not possible to find
     * a known type that has additional attributes and relationships. To avoid leaking
     * junk data to the user, custom attributes and relationships are not added to the
     * basic entity. Known attributes and relationships will be added to known entity types.
     */
    let entity: Entity | null = null;
    const genericEntity: GenericEntity = {
      id: entityRow.id,
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
      const version = await this._knex("version")
        .select(this._knex.max("index"))
        .join("paper", { "paper.s2_id": "version.paper_id" })
        .where(paperSelector);
      if (version === undefined) {
        /**
         * TODO(andrewhead): figure out a way to flag errors.
         */
        return [];
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
      .join("entity", { "boundingbox.entity_id": "entity.id" })
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
        return this.createEntity(
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
    entity_id: string,
    bounding_boxes: BoundingBox[]
  ): BoundingBoxRow[] {
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
   * 'entitydata' table to preserve all that's worth knowing about this entity. This method does
   * some validation to make sure that the attributes and relationships are in the expected format
   * before attempting to create data rows for this.
   *
   * Currently this method takes a conservative approach, creating rows only for known data fields
   * for known types of entities.
   *
   * This method also expects that server validation has already run
   * on the entity to ensure that all attribute values are of the expected types (e.g.,
   * strings, numbers, lists of strings, or 'null') and that all relationships follow the JSON
   * API relationship convention.
   */
  createEntityDataRows(
    entity_id: string,
    entity_type: string,
    attributes: GenericAttributes,
    relationships: GenericRelationships
  ) {
    const rows: EntityDataRow[] = [];
    const addRow = (
      type: EntityDataRowType,
      key: string,
      value: string | null
    ) => {
      rows.push({
        entity_id,
        source: attributes.source,
        type,
        key,
        value,
      });
    };

    /**
     * Symbol data.
     */
    if (entity_type === "symbol") {
      if (typeof attributes.mathml === "string") {
        addRow("scalar", "mathml", attributes.mathml);
      }
      if (Array.isArray(attributes.mathml_near_matches)) {
        attributes.mathml_near_matches.forEach((mathml) => {
          addRow("scalar-list", "mathml_near_matches", mathml);
        });
      }
      if (isRelationship(relationships.sentence)) {
        addRow("reference", "sentence", relationships.sentence.id);
      }
      if (Array.isArray(relationships.children)) {
        relationships.children.forEach((c) => {
          addRow("reference-list", "children", c.id);
        });
      }
    }

    /**
     * Citation data.
     */
    if (entity_type === "citation") {
      if (typeof attributes.paper_id === "string") {
        addRow("scalar", "paper_id", attributes.paper_id);
      }
    }

    /**
     * Sentence data.
     */
    if (entity_type === "sentence") {
      if (typeof attributes.text === "string") {
        addRow("scalar", "text", attributes.text);
      }
      if (typeof attributes.tex_start === "number") {
        addRow("scalar", "tex_start", String(attributes.tex_start));
      }
      if (typeof attributes.tex_end === "number") {
        addRow("scalar", "tex_end", String(attributes.tex_end));
      }
    }

    return rows;
  }

  async postEntity(paperSelector: PaperSelector, data: Omit<Entity, "id">) {
    /**
     * Fetch the ID for the specified paper.
     */
    const paperRows = await this._knex("paper")
      .select("s2_id AS id")
      .where(paperSelector);
    const paperId = paperRows[0].id;

    /**
     * Create new entity.
     */
    const entityRow: Omit<EntityRow, "id"> = {
      paper_id: paperId,
      type: data.type,
      version: data.attributes.version,
      source: data.attributes.source,
    };
    const id = (await this._knex("entity")
      .insert(entityRow)
      .returning("id")) as number;

    /**
     * Insert bounding boxes and data for entity. Must occur after the entity is inserted in
     * order to have access to the entity ID.
     */
    const boundingBoxRows: BoundingBoxRow[] = this.createBoundingBoxRows(
      String(id),
      data.attributes.bounding_boxes
    );
    const entityDataRows: EntityDataRow[] = this.createEntityDataRows(
      String(id),
      data.type,
      data.attributes,
      data.relationships as GenericRelationships
    );
    await this._knex.batchInsert("boundingbox", boundingBoxRows);
    await this._knex.batchInsert("entitydata", entityDataRows);

    /**
     * Create a sanitized version of the entity to return to the client.
     */
    const cleanedEntity = this.createEntity(
      { ...entityRow, id: String(id) },
      boundingBoxRows,
      entityDataRows
    );
    return cleanedEntity;
  }

  async patchAnnotation(data: Pick<Entity, "type" | "id"> & Partial<Entity>) {
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
      this._knex("entity").update(entityRowUpdates).where({ id: data.id });
    }

    if (data.attributes !== undefined) {
      /**
       * Update bounding boxes.
       */
      if (data.attributes.bounding_boxes !== undefined) {
        await this._knex("boundingbox").delete().where({ entity_id: data.id });
        const boundingBoxRows = this.createBoundingBoxRows(
          data.id,
          data.attributes.bounding_boxes
        );
        await this._knex.batchInsert("boundingbox", boundingBoxRows);
      }

      /**
       * Update custom attributes, by removing previous values for known attributes and updating
       * them to the new values.
       */
      const attributeRows = this.createEntityDataRows(
        data.id,
        data.type,
        data.attributes,
        {}
      );
      for (const row of attributeRows) {
        await this._knex("entitydata")
          .delete()
          .where({ entity_id: data.id, type: row.type, key: row.key });
      }
      this._knex.batchInsert("entitydata", attributeRows);
    }

    /**
     * Update relationships.
     */
    if (data.relationships !== undefined) {
      await this._knex("entitydata")
        .delete()
        .where({ entity_id: data.id })
        .andWhere((builder) =>
          builder.whereIn("type", ["reference", "reference-list"])
        );
      const relationshipRows = this.createEntityDataRows(
        data.id,
        data.type,
        {},
        data.relationships as GenericRelationships
      );
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
