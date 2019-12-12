import * as Knex from "knex";
import * as _ from "lodash";
import * as nconf from "nconf";

interface BoundingBox {
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
  papers: string[];
  bounding_boxes: BoundingBox[];
}

type CitationsById = { [id: string]: Citation };

interface Symbol {
  id: number;
  mathml: string;
  bounding_box: BoundingBox;
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

interface Annotation extends AnnotationData {
  id: number;
}

/**
 * See also the REST API validation for 'annotation' in 'validation.ts'. JSON objects that have
 * passed that validation should be of type 'AnnotationData'.
 */
export interface AnnotationData {
  type: "citation" | "symbol";
  boundingBox: BoundingBox;
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
      }
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
    return response.rows.map(row => ({
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
      const key = row["citation_id"];
      if (!citations.hasOwnProperty(key)) {
        citations[key] = {
          bounding_boxes: [],
          papers: []
        };
      }
      const s2Id = row["cited_paper_id"];
      const bounding_box: BoundingBox = {
        page: row.page,
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height
      };
      add_paper(citations[key], s2Id);
      add_bounding_box(citations[key], bounding_box);
    }
    return Object.values(citations);
  }

  async getSymbolsForArxivId(arxivId: string) {
    const rows = await this._knex("paper")
      .select(
        "symbol.id AS symbol_id",
        "mathml",
        this._knex.raw("array_agg(children.child_id) children_ids"),
        "parents.parent_id AS parent_id",
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
        "parents.parent_id",
        "page",
        "left",
        "top",
        "width",
        "height"
      );

    const symbols = rows.map(row => {
      const boundingBox: BoundingBox = {
        page: row.page,
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height
      };
      const symbol: Symbol = {
        id: row.symbol_id,
        mathml: row.mathml,
        parent: row.parent_id,
        children: row.children_ids,
        bounding_box: boundingBox
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
      type: row.annotation_id,
      boundingBox: {
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
    const { page, left, top, width, height } = annotationData.boundingBox;
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
  ) {
    let created = false;
    const { type } = annotationData;
    const { page, left, top, width, height } = annotationData.boundingBox;

    const updatedRowIds = await this._knex("annotation")
      .update({ page, left, top, width, height, type })
      .where({ "annotation.id": id })
      .whereIn(
        "annotation.paper_id",
        this._knex("paper")
          .select("s2_id")
          .where({ "paper.arxiv_id": arxivId })
      )
      .returning("id");

    if (updatedRowIds.length == 0) {
      await this._knex.raw(
        'INSERT INTO annotation (id, page, "left", top, width, height, paper_id, "type") ' +
          "SELECT ?, ?, ?, ?, ?, ?, s2_id, ? " +
          "FROM paper WHERE arxiv_id = ?",
        [id, page, left, top, width, height, type, arxivId]
      );
      created = true;
    }

    const annotation = { ...annotationData, id };
    return {
      created,
      annotation
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

function add_paper(citation: Citation, s2Id: string) {
  if (citation.papers.indexOf(s2Id) === -1) {
    citation.papers.push(s2Id);
  }
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
