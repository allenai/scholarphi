import React from "react";
import { Block } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import Marker from "./Marker";

interface Props {
  pageView: PDFPageView;
  showId: string;
  blocks: Block[];
  handleMarkerClicked?: (id: string) => void;
}

class BlockMarkerLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, blocks, showId } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    return (
      <div className={"marker-layer"}>
        {blocks
          .filter((block: Block) => block.boxes[0].page === pageNumber)
          .map((block) => (
            <Marker
              key={block.id}
              id={block.id}
              show={block.id === showId}
              pageView={pageView}
              anchor={block.boxes[0]}
              handleMarkerClicked={this.props.handleMarkerClicked}
            />
          ))}
      </div>
    );
  }
}

export default BlockMarkerLayer;
