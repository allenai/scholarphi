import React from "react";
import { Block } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import HighlightMarginControls from "./HighlightMarginControls";

interface Props {
  pageView: PDFPageView;
  showId: string;
  blocks: Block[];
  disableIncreaseHighlights: boolean;
  disableDecreaseHighlights: boolean;
  handleIncreaseHighlights: (id: string) => void;
  handleDecreaseHighlights: (id: string) => void;
}

class HighlightMarginControlsLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      pageView,
      blocks,
      showId,
      disableIncreaseHighlights,
      disableDecreaseHighlights,
    } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    return (
      <div className={"marker-layer"}>
        {blocks
          .filter((block: Block) => block.boxes[0].page === pageNumber)
          .map((block) => {
            // Handle blocks spanning two columns (this is very hacky and brittle!)
            // TODO: Figure out a better way to do this...
            const maxLeft = block.boxes.reduce((b1, b2) => {
              return b1.left > b2.left ? b1 : b2;
            }).left;
            let g1 = [];
            let g2 = [];
            for (const box of block.boxes) {
              const boxRight = box.left + box.width;
              boxRight < maxLeft ? g1.push(box) : g2.push(box);
            }

            g1 = uiUtils.sortBoundingBoxes(g1);
            g2 = uiUtils.sortBoundingBoxes(g2);
            const sortedBoxes = g1.length > g2.length ? g1 : g2;

            const blockHeight =
              sortedBoxes[sortedBoxes.length - 1].top -
              sortedBoxes[0].top +
              sortedBoxes[sortedBoxes.length - 1].height;
            const anchor = {
              page: pageNumber,
              left: sortedBoxes[0].left,
              top: sortedBoxes[0].top + blockHeight / 2,
              height: blockHeight,
              width: 0, // Irrelevant
            };
            return (
              <HighlightMarginControls
                key={block.id}
                id={block.id}
                show={block.id === showId}
                disableIncreaseHighlights={disableIncreaseHighlights}
                disableDecreaseHighlights={disableDecreaseHighlights}
                pageView={pageView}
                anchor={anchor}
                handleIncreaseHighlights={this.props.handleIncreaseHighlights}
                handleDecreaseHighlights={this.props.handleDecreaseHighlights}
              />
            );
          })}
      </div>
    );
  }
}

export default HighlightMarginControlsLayer;
