import * as Knex from "knex";
import * as _ from "lodash";
import * as nconf from "nconf";

interface BoundingBox {
  id: number;
  /**
   * Page indexes start at 0.
   */
  page: number;
  left: number;
  /**
   * 'Top' is the y-position of the top of the bounding box, measured from the bottom of the page.
   */
  top: number;
  width: number;
  height: number;
}

interface Citation {
  id: number;
  source: string;
  paper: string;
  bounding_boxes: BoundingBox[];
}

type CitationsById = { [id: string]: Citation };

interface Symbol {
  id: number;
  source: string;
  mathml: string;
  bounding_boxes: BoundingBox[];
  /**
   * The ID of the parent symbol of this symbol. Null if it does not have a parent.
   */
  parent: number | null;
  /**
   * IDs of child symbols.
   */
  children: number[];
}

interface MathMlMatch {
  rank: number;
  mathMl: string;
}

interface MathMl {
  mathMl: string;
  /**
   * Matches are ordered by rank, from highest to lowest.
   */
  matches: MathMlMatch[];
}

interface Annotation {
  id: number;
  type: "citation" | "symbol";
  boundingBox: BoundingBox;
}

/**
 * See also the REST API validation for 'annotation' in 'validation.ts'. JSON objects that have
 * passed that validation should be of type 'AnnotationData'.
 */
export interface AnnotationData {
  type: "citation" | "symbol";
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PaperWithEntityCounts {
  s2_id: string;
  arxiv_id?: string;
  citations: string;
  symbols: string;
}

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
        ssl: true
      },
      searchPath: [config.get("database:schema")]
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
      .filter(row => parseInt(row.citations) > 0 || parseInt(row.symbols) > 0)
      .map(row => ({
        s2Id: row.s2_id,
        arxivId: row.arxiv_id,
        extractedCitationCount: parseInt(row.citations),
        extractedSymbolCount: parseInt(row.symbols)
      }));
  }

  async getCitationsForS2Id(s2Id: string) {
    return await this.getCitationsForPaper({ s2_id: s2Id });
  }

  async getCitationsForArxivId(arxivId: string) {
    return await this.getCitationsForPaper({ arxiv_id: arxivId });
  }

  async getCitationsForPaper(paperSelector: PaperSelector) {
    const rows = await this._knex("paper")
      .select(
        "citation.id AS citation_id",
        "citationpaper.paper_id AS cited_paper_id",
        "entity.source AS source",
        "boundingbox.id AS bounding_box_id",
        "page",
        "left",
        "top",
        "width",
        "height"
      )
      .where(paperSelector)
      // Get citations.
      .join("citation", { "paper.s2_id": "citation.paper_id" })
      // Get bounding box for each citation.
      .join("entity", { "citation.id": "entity.entity_id" })
      .where({ "entity.type": "citation" })
      .join("entityboundingbox", { "entity.id": "entityboundingbox.entity_id" })
      .join("boundingbox", {
        "entityboundingbox.bounding_box_id": "boundingbox.id"
      })
      // Get S2 paper ID for each citation.
      .join("citationpaper", { "citation.id": "citationpaper.citation_id" });

    const citations: CitationsById = {};
    for (const row of rows) {
      const key = Number(row["citation_id"]);
      if (!citations.hasOwnProperty(key)) {
        citations[key] = {
          id: key,
          source: row.source,
          bounding_boxes: [],
          paper: row.cited_paper_id
        };
      }
      const bounding_box: BoundingBox = {
        id: row.bounding_box_id,
        page: row.page,
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height
      };
      add_bounding_box(citations[key], bounding_box);
    }
    return Object.values(citations);
  }

  async getSymbolsForArxivId(arxivId: string) {
    const rows = await this._knex("paper")
      .select(
        "symbol.id AS symbol_id",
        "mathml",
        "entity.source AS source",
        this._knex.raw("array_agg(children.child_id) children_ids"),
        "parents.parent_id AS parent_id",
        "boundingbox.id AS bounding_box_id",
        "page",
        "left",
        "top",
        "width",
        "height"
      )
      .where({ arxiv_id: arxivId })
      // Get symbols.
      .join("symbol", { "paper.s2_id": "symbol.paper_id" })
      // Get MathML.
      .join("mathml", { "symbol.mathml_id": "mathml.id" })
      // Get bounding box.
      .join("entity", { "symbol.id": "entity.entity_id" })
      .where({ "entity.type": "symbol" })
      .join("entityboundingbox", { "entity.id": "entityboundingbox.entity_id" })
      .join("boundingbox", {
        "entityboundingbox.bounding_box_id": "boundingbox.id"
      })
      // Get the symbol's parent.
      .leftOuterJoin("symbolchild AS parents", function() {
        this.on({ "symbol.id": "parents.child_id" }).orOnNull(
          "parents.child_id"
        );
      })
      // Get the symbol's children.
      .leftOuterJoin("symbolchild AS children", function() {
        this.on({ "symbol.id": "children.parent_id" }).orOnNull(
          "children.parent_id"
        );
      })
      // Aggregate a list of children by aggregating by all other fields.
      .groupBy(
        "symbol_id",
        "mathml",
        "entity.source",
        "parents.parent_id",
        "boundingbox.id",
        "page",
        "left",
        "top",
        "width",
        "height"
      );

    const symbols = rows.map(row => {
      const boundingBox: BoundingBox = {
        id: row.bounding_box_id,
        page: row.page,
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height
      };
      const symbol: Symbol = {
        id: row.symbol_id,
        source: row.source,
        mathml: row.mathml,
        parent: row.parent_id,
        children: row.children_ids,
        bounding_boxes: [boundingBox]
      };
      return symbol;
    });

    return symbols;
  }

  async getMathMlForArxivId(arxivId: string) {
    const rows = await this._knex("paper")
      .select(
        "mathml.mathml AS mathml",
        "mathml2.mathml AS matching_mathml",
        "mathmlmatch.rank AS rank"
      )
      .where({ arxiv_id: arxivId })
      // Get list of MathML matches for paper.
      .join("mathmlmatch", { "paper.s2_id": "mathmlmatch.paper_id" })
      // Get MathML.
      .join("mathml", { "mathmlmatch.mathml_id": "mathml.id" })
      .join("mathml AS mathml2", { "mathmlmatch.match_id": "mathml2.id" })
      .orderBy(["mathml.id", { column: "rank", order: "asc" }]);

    const matchesByMathMl: { [mathml: string]: MathMlMatch[] } = {};
    for (const row of rows) {
      const mathMl = row.mathml;
      if (matchesByMathMl[mathMl] === undefined) {
        matchesByMathMl[mathMl] = [];
      }
      matchesByMathMl[mathMl].push({
        mathMl: row.matching_mathml,
        rank: row.rank
      });
    }

    const allMathMl: MathMl[] = [];
    for (const mathMl of Object.keys(matchesByMathMl)) {
      allMathMl.push({
        mathMl,
        matches: matchesByMathMl[mathMl]
      });
    }

    return allMathMl;
  }

  async getAnnotationsForArxivId(arxivId: string) {
    const rows = await this._knex("paper")
      .select(
        "annotation.id AS annotation_id",
        "type",
        "page",
        "left",
        "top",
        "width",
        "height"
      )
      .where({ arxiv_id: arxivId })
      // Get annotations.
      .join("annotation", { "paper.s2_id": "annotation.paper_id" });

    const annotations: Annotation[] = rows.map(row => ({
      id: row.annotation_id,
      type: row.type,
      boundingBox: {
        id: row.annotation_id,
        page: row.page,
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height
      }
    }));
    return annotations;
  }

  async postAnnotationForArxivId(
    arxivId: string,
    annotationData: AnnotationData
  ) {
    const { type } = annotationData;
    const { page, left, top, width, height } = annotationData;
    const result = await this._knex.raw(
      'INSERT INTO annotation (page, "left", top, width, height, paper_id, "type") ' +
        "SELECT ?, ?, ?, ?, ?, s2_id, ? " +
        "FROM paper WHERE arxiv_id = ? " +
        "RETURNING annotation.id",
      [page, left, top, width, height, type, arxivId]
    );
    return result.rows[0].id;
  }

  async putAnnotation(
    arxivId: string,
    id: number,
    annotationData: AnnotationData
  ): Promise<Annotation> {
    const { type } = annotationData;
    const { page, left, top, width, height } = annotationData;

    await this._knex("annotation")
      .update({
        page,
        left,
        top,
        width,
        height,
        type,
        updated_at: this._knex.raw("NOW()")
      })
      .where({ "annotation.id": id })
      .whereIn(
        "annotation.paper_id",
        this._knex("paper")
          .select("s2_id")
          .where({ "paper.arxiv_id": arxivId })
      )
      .returning("id");

    return {
      id,
      type: annotationData.type,
      boundingBox: {
        id,
        page: annotationData.page,
        left: annotationData.left,
        top: annotationData.top,
        width: annotationData.width,
        height: annotationData.height
      }
    };
  }

  async deleteAnnotation(arxivId: string, id: number) {
    await this._knex("annotation")
      .delete()
      .where({ "annotation.id": id })
      .whereIn(
        "annotation.paper_id",
        this._knex("paper")
          .select("s2_id")
          .where({ "paper.arxiv_id": arxivId })
      );
  }

  private _knex: Knex;
}

function add_bounding_box(citation: Citation, box: BoundingBox) {
  if (!citation.bounding_boxes.some(b => _.isEqual(b, box))) {
    citation.bounding_boxes.push(box);
  }
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
