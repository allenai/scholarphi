import { createCreateEntityDataWithBoxes } from "./EntityCreationToolbar";
import { Point } from "./Selection";
import SelectionCanvas from "./SelectionCanvas";
import { KnownEntityType } from "../../../state";
import { EntityCreateData } from "../../../api/types";
import { PDFPageView } from "../../../types/pdfjs-viewer";
import * as uiUtils from "../../../utils/ui";

import React from "react";

interface Props {
  pageNumber: number;
  /**
   * The PDFPageView this annotation layer will be added on top of. The pageView is needed for
   * transforming annotation bounding boxes into render locations in the page 'div'.
   */
  pageView: PDFPageView;
  entityType: KnownEntityType;
  handleShowSnackbarMessage: (message: string) => void;
  handleCreateEntity: (entity: EntityCreateData) => Promise<string | null>;
}

interface State {
  state: "canvas-enabled" | "creating-entity";
}

/**
 * Supports the specification of bounding boxes for new entities using rectangular selections.
 */
export class EntityCreationCanvas extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { state: "canvas-enabled" };
    this.onSelectionMade = this.onSelectionMade.bind(this);
  }

  async onSelectionMade(anchor: Point, active: Point) {
    const { handleCreateEntity, entityType } = this.props;
    this.setState({
      state: "creating-entity",
    });
    const entityId = await handleCreateEntity(
      createCreateEntityDataFromSelection(
        this.props.pageView,
        anchor,
        active,
        entityType
      )
    );
    if (entityId === null) {
      this.props.handleShowSnackbarMessage(
        "Entity could not be created. Check that you are connected to the internet."
      );
    }
    this.setState({
      state: "canvas-enabled",
    });
  }

  render() {
    return (
      <>
        <SelectionCanvas
          key="selection-canvas"
          wait={this.state.state !== "canvas-enabled"}
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
  type: KnownEntityType
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
    page: uiUtils.getPageNumber(pageView),
    source: "human-annotation",
    left: Math.min(anchorPdfX, activePdfX),
    top: Math.min(anchorPdfY, activePdfY),
    width: Math.abs(activePdfX - anchorPdfX),
    height: Math.abs(activePdfY - anchorPdfY),
  };

  return createCreateEntityDataWithBoxes([boundingBox], type);
}

export default EntityCreationCanvas;
