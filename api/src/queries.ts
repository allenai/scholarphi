import * as Knex from "knex";
import * as _ from "lodash";
import * as nconf from "nconf";

interface Locatable {
  bounding_boxes: BoundingBox[];
}

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

interface Citation extends Locatable {
  papers: string[];
}

type CitationsById = { [id: string]: Citation };

interface Symbol extends Locatable {
  tex: string;
}

type SymbolsById = { [id: string]: Symbol };

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

  async getCitationsForS2Id(s2Id: string) {
    return await this.getCitationsForPaper({ s2_id: s2Id });
  }

  async getCitationsForArxivId(arxivId: string) {
    return await this.getCitationsForPaper({ arxiv_id: arxivId });
  }

  async getCitationsForPaper(paperSelector: PaperSelector) {
    const rows = await this._knex("paper")
      .select(
        "citation.id as citation_id",
        "citationpaper.paper_id as cited_paper_id",
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
      .join("boundingbox", { "entityboundingbox.bounding_box_id": "boundingbox.id" })
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
      .select("symbol.id as symbol_id", "tex", "page", "left", "top", "width", "height")
      .where({ arxiv_id: arxivId })
      // Get symbols.
      .join("symbol", { "paper.s2_id": "symbol.paper_id" })
      // Get bounding box for each symbol.
      .join("entity", { "symbol.id": "entity.entity_id" })
      .where({ "entity.type": "symbol" })
      .join("entityboundingbox", { "entity.id": "entityboundingbox.entity_id" })
      .join("boundingbox", { "entityboundingbox.bounding_box_id": "boundingbox.id" });

    const symbols: SymbolsById = {};
    for (const row of rows) {
      const key = row["symbol_id"];
      if (!symbols.hasOwnProperty(key)) {
        symbols[key] = {
          bounding_boxes: [],
          tex: row["tex"]
        };
      }
      const bounding_box: BoundingBox = {
        page: row.page,
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height
      };
      add_bounding_box(symbols[key], bounding_box);
    }
    return Object.values(symbols);
  }

  private _knex: Knex;
}

function add_paper(citation: Citation, s2Id: string) {
  if (citation.papers.indexOf(s2Id) === -1) {
    citation.papers.push(s2Id);
  }
}

function add_bounding_box(locatable: Locatable, box: BoundingBox) {
  if (!locatable.bounding_boxes.some(b => _.isEqual(b, box))) {
    locatable.bounding_boxes.push(box);
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
