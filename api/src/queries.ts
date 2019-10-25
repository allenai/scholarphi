import * as Knex from "knex";
import * as _ from "lodash";
import * as nconf from "nconf";

interface BoundingBox {
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Paper {
  s2Id: string;
  title: string;
  authors: string;
  abstract: string | null;
  venue: string | null;
  year: number | null;
}

interface Citation {
  bounding_boxes: BoundingBox[];
  papers: Paper[];
}

type CitationsById = { [id: string]: Citation };

export class Connection {
  constructor(config: nconf.Provider) {
    this._knex = Knex({
      client: "pg",
      connection: {
        host: config.get("database:host"),
        port: config.get("database:port"),
        user: config.get("database:user"),
        password: config.get("database:password"),
        database: config.get("database:database")
      }
    });
  }

  async getCitations(s2Id: string) {
    const rows = await this._knex("paper")
      .select(
        "citation.id as citation_id",
        "citationpaper.paper_id as cited_paper_id",
        "title",
        "authors",
        "abstract",
        "year",
        "venue",
        "page",
        "left",
        "top",
        "width",
        "height"
      )
      .where({ s2_id: s2Id })
      // Get citations.
      .join("citation", { "paper.s2_id": "citation.paper_id" })
      // Get bounding box for each citation.
      .join("entity", { "citation.id": "entity.entity_id" })
      .where({ "entity.type": "citation" })
      .join("entityboundingbox", { "entity.id": "entityboundingbox.entity_id" })
      .join("boundingbox", { "entityboundingbox.bounding_box_id": "boundingbox.id" })
      // Get summary data for each paper cited in a citation.
      .join("citationpaper", { "citation.id": "citationpaper.citation_id" })
      .join("summary", { "citationpaper.paper_id": "summary.paper_id" });

    const citations: CitationsById = {};
    for (const row of rows) {
      const key = row["citation_id"];
      if (!citations.hasOwnProperty(key)) {
        citations[key] = {
          bounding_boxes: [],
          papers: []
        };
      }
      const paper: Paper = {
        s2Id: row["cited_paper_id"],
        title: row.title,
        authors: row.authors,
        abstract: row.abstract,
        venue: row.venue,
        year: row.year
      };
      const bounding_box: BoundingBox = {
        page: row.page,
        left: row.left,
        top: row.top,
        width: row.width,
        height: row.height
      };
      add_paper(citations[key], paper);
      add_bounding_box(citations[key], bounding_box);
    }
    return Object.values(citations);
  }

  private _knex: Knex;
}

function add_paper(citation: Citation, paper: Paper) {
  if (!citation.papers.some(p => _.isEqual(p, paper))) {
    citation.papers.push(paper);
  }
}

function add_bounding_box(citation: Citation, box: BoundingBox) {
  if (!citation.bounding_boxes.some(b => _.isEqual(b, box))) {
    citation.bounding_boxes.push(box);
  }
}
