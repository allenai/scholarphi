import React from "react";
import { Point } from "./Selection";
import SelectionCanvas from "./SelectionCanvas";
import { KnownEntityType } from "./state";
import {
  CitationAttributes,
  EntityCreateData,
  SentenceAttributes,
  SymbolAttributes,
  SymbolRelationships,
} from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageNumber: number;
  /**
   * The PDFPageView this annotation layer will be added on top of. The pageView is needed for
   * transforming annotation bounding boxes into render locations in the page 'div'.
   */
  pageView: PDFPageView;
  entityType: KnownEntityType;
  handleCreateEntity: (entity: EntityCreateData) => void;
}

export class UserAnnotationLayer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onSelectionMade = this.onSelectionMade.bind(this);
  }

  onSelectionMade(anchor: Point, active: Point) {
    const { handleCreateEntity, entityType: annotationType } = this.props;
    handleCreateEntity(
      createCreateEntityDataFromSelection(
        this.props.pageView,
        anchor,
        active,
        annotationType
      )
    );
  }

  render() {
    return (
      <>
        <SelectionCanvas
          key="selection-canvas"
          onSelection={this.onSelectionMade}
        />
      </>
    );
  }
}

function createCreateEntityDataFromSelection(
  pageView: PDFPageView,
  anchor: Point,
  active: Point,
  type?: KnownEntityType
): EntityCreateData {
  const viewport = pageView.viewport;
  const [anchorPdfX, anchorPdfY] = [
    anchor.x / viewport.width,
    anchor.y / viewport.height,
  ];
  const [activePdfX, activePdfY] = [
    active.x / viewport.width,
    active.y / viewport.height,
  ];

  const boundingBox = {
    page: pageView.pdfPage.pageNumber - 1,
    source: "human-annotation",
    left: Math.min(anchorPdfX, activePdfX),
    top: Math.min(anchorPdfY, activePdfY),
    width: Math.abs(activePdfX - anchorPdfX),
    height: Math.abs(activePdfY - anchorPdfY),
  };

  let data: EntityCreateData = {
    type: type as string,
    attributes: {
      source: "human-annotation",
      version: undefined,
      bounding_boxes: [boundingBox],
    },
    relationships: {},
  };

  /*
   * Set default values for known entity types. If this step is skipped, the API server might
   * reject the creation of the entity due to missing properties.
   */
  if (type === "citation") {
    data.attributes = {
      ...data.attributes,
      paper_id: null,
    } as Omit<CitationAttributes, "version">;
  } else if (type === "symbol") {
    data.attributes = {
      ...data.attributes,
      mathml: null,
      mathml_near_matches: [],
    } as Omit<SymbolAttributes, "version">;
    data.relationships = {
      sentence: { type: "sentence", id: null },
      children: [],
    } as Omit<SymbolRelationships, "version">;
  } else if (type === "sentence") {
    data.attributes = {
      ...data.attributes,
      text: null,
      tex: null,
      tex_start: null,
      tex_end: null,
    } as Omit<SentenceAttributes, "version">;
  }

  return data;
}

export default UserAnnotationLayer;
