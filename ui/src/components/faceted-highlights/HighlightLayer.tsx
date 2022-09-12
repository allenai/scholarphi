import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { BoundingBox, FacetedHighlight } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

const logger = getRemoteLogger();

interface Props {
  pageView: PDFPageView;
  facetedHighlights: FacetedHighlight[];
  opacity: number;
  drawerOpen: boolean;
  handleHighlightSelected: (d: FacetedHighlight) => void;
  handleHideHighlight: (d: FacetedHighlight) => void;
  handleOpenDrawer: () => void;
  handleCloseDrawer: () => void;
  selectSnippetInDrawer: (d: FacetedHighlight) => void;
}

interface State {
  focusedHighlight: FacetedHighlight | null;
  clickedLineBox: BoundingBox | null;
  clickX: number | null;
}

class HighlightLayer extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      focusedHighlight: null,
      clickedLineBox: null,
      clickX: null,
    };
  }

  onClickSentence = (
    event: React.MouseEvent,
    sentence: FacetedHighlight,
    lineIndex: number
  ) => {
    logger.log("debug", "click-highlight", { highlight: sentence });
    const pageRect = this.props.pageView.div.getBoundingClientRect();
    this.clearAllSelected();
    this.props.handleHighlightSelected(sentence);
    this.markHighlightAsSelected(sentence);
    this.props.selectSnippetInDrawer(sentence);
    if (!this.props.drawerOpen) {
      this.props.handleOpenDrawer();
      setTimeout(() => {
        if (this.state.focusedHighlight !== null) {
          this.props.selectSnippetInDrawer(this.state.focusedHighlight);
        }
      }, 300);
    }
    this.setState({
      focusedHighlight: sentence,
      clickedLineBox: sentence.boxes[lineIndex],
      clickX: event.clientX - pageRect.left,
    });
  };

  markHighlightAsSelected = (d: FacetedHighlight) => {
    uiUtils.addClassToElementsByClassname(`highlight-${d.id}`, "selected");
  };

  clearAllSelected = () => {
    uiUtils.removeClassFromElementsByClassname("selected");
  };

  markHighlightAsHovered = (d: FacetedHighlight) => {
    uiUtils.addClassToElementsByClassname(`highlight-${d.id}`, "hovered");
  };

  clearAllHovered = () => {
    uiUtils.removeClassFromElementsByClassname("hovered");
  };

  render() {
    const { pageView, facetedHighlights, opacity } = this.props;

    const pageNumber = uiUtils.getPageNumber(pageView);
    const { width, height } = uiUtils.getPageViewDimensions(pageView);

    return (
      <>
        {facetedHighlights &&
          facetedHighlights.map((d, i) =>
            d.boxes
              .filter((b) => b.page === pageNumber)
              .map((b, j) => {
                // Add left rounded borders to the first span of each highlight
                // and right rounded borders to the last span of each highlight
                const borderRadius =
                  j === d.boxes.length - 1
                    ? "0px 10px 10px 0px"
                    : j === 0
                    ? "10px 0px 0px 10px"
                    : 0;
                const highlightVerticalOffset = 4;
                const highlightLeftOffset = 4;
                return (
                  <React.Fragment key={`highlight-${i}-${j}`}>
                    <Tooltip
                      disableFocusListener
                      disableTouchListener
                      title={d.label.replace(/(^\w|\s\w)/g, (m) =>
                        m.toUpperCase()
                      )}
                    >
                      <div
                        className={`highlight-mask__highlight facet-highlight highlight-${d.id}`}
                        onMouseEnter={() => {
                          this.markHighlightAsHovered(d);
                          logger.log("debug", "hover-highlight", {
                            highlight: d,
                          });
                        }}
                        onMouseLeave={this.clearAllHovered}
                        onMouseDown={(event: React.MouseEvent) => {
                          this.onClickSentence(event, d, j);
                        }}
                        style={{
                          position: "absolute",
                          left: b.left * width - highlightLeftOffset,
                          top: b.top * height - highlightVerticalOffset,
                          width: b.width * width + highlightLeftOffset,
                          height: b.height * height * 1.2,
                          backgroundColor: d.color,
                          borderRadius: borderRadius,
                          opacity: opacity,
                        }}
                      />
                    </Tooltip>
                  </React.Fragment>
                );
              })
          )}
      </>
    );
  }
}

export default HighlightLayer;
