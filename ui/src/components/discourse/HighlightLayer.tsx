import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { BoundingBox, DiscourseObj } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import DiscourseControlToolbar from "./DiscourseControlToolbar";

const logger = getRemoteLogger();

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
  opacity: number;
  drawerOpen: boolean;
  handleDiscourseObjSelected: (d: DiscourseObj) => void;
  handleHideDiscourseObj: (d: DiscourseObj) => void;
  handleOpenDrawer: () => void;
  handleCloseDrawer: () => void;
  handleFilterToDiscourse: (discourse: string) => void;
  selectSnippetInDrawer: (d: DiscourseObj) => void;
}

interface State {
  showControlToolbar: boolean;
  focusedDiscourseObj: DiscourseObj | null;
  clickedLineBox: BoundingBox | null;
  clickX: number | null;
}

class HighlightLayer extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showControlToolbar: false,
      focusedDiscourseObj: null,
      clickedLineBox: null,
      clickX: null,
    };
  }

  componentDidMount = () => {
    document.body.addEventListener("click", this.onClickAnywhere);
  };

  onClickAnywhere = (event: MouseEvent) => {
    /*
     * If a click occurred within the page and it was not only the tooltip or a
     * highlight, then dismiss the highlight toolbar.
     */
    if (!(event.target instanceof Node)) {
      return;
    }
    if (
      !uiUtils.findParentElement(event.target, (e) =>
        e.classList.contains("page")
      )
    ) {
      return;
    }
    if (
      !uiUtils.findParentElement(
        event.target,
        (e) =>
          e.classList.contains("highlight-mask__highlight") ||
          e.classList.contains("discourse-control-toolbar")
      )
    ) {
      logger.log("debug", "click-anywhere-close-toolbar");
      this.closeControlToolbar();
      this.clearAllSelected();
    }
  };

  onClickSentence = (
    event: React.MouseEvent,
    sentence: DiscourseObj,
    lineIndex: number
  ) => {
    logger.log("debug", "click-highlight", { discourse: sentence });
    const pageRect = this.props.pageView.div.getBoundingClientRect();
    this.clearAllSelected();
    this.props.handleDiscourseObjSelected(sentence);
    this.markHighlightAsSelected(sentence);
    this.props.selectSnippetInDrawer(sentence);
    if (!this.props.drawerOpen) {
      this.props.handleOpenDrawer();
      setTimeout(() => {
        if (this.state.focusedDiscourseObj !== null) {
          this.props.selectSnippetInDrawer(this.state.focusedDiscourseObj);
        }
      }, 300);
    }
    this.setState({
      // showControlToolbar: true,
      focusedDiscourseObj: sentence,
      clickedLineBox: sentence.boxes[lineIndex],
      clickX: event.clientX - pageRect.left,
    });
  };

  closeControlToolbar = () => {
    this.setState({
      showControlToolbar: false,
      focusedDiscourseObj: null,
      clickedLineBox: null,
      clickX: null,
    });
  };

  markHighlightAsSelected = (d: DiscourseObj) => {
    uiUtils.addClassToElementsByClassname(`highlight-${d.id}`, "selected");
  };

  clearAllSelected = () => {
    uiUtils.removeClassFromElementsByClassname("selected");
  };

  markHighlightAsHovered = (d: DiscourseObj) => {
    uiUtils.addClassToElementsByClassname(`highlight-${d.id}`, "hovered");
  };

  clearAllHovered = () => {
    uiUtils.removeClassFromElementsByClassname("hovered");
  };

  render() {
    const { pageView, discourseObjs, opacity, drawerOpen } = this.props;
    const {
      showControlToolbar,
      focusedDiscourseObj,
      clickedLineBox,
      clickX,
    } = this.state;

    let tooltipX = clickX;
    let tooltipY = null;
    if (clickedLineBox !== null) {
      const lineRect = uiUtils.getPositionInPageView(pageView, clickedLineBox);
      tooltipY = lineRect.top + lineRect.height;
    }

    const pageNumber = uiUtils.getPageNumber(pageView);
    const { width, height } = uiUtils.getPageViewDimensions(pageView);

    return (
      <>
        {discourseObjs &&
          discourseObjs.map((d, i) =>
            d.boxes
              .filter((b) => b.page === pageNumber)
              .map((b, j) => (
                <React.Fragment key={`highlight-${i}-${j}`}>
                  <Tooltip
                    disableFocusListener
                    disableTouchListener
                    title={d.label.replace(/(^\w|\s\w)/g, (m) =>
                      m.toUpperCase()
                    )}
                  >
                    <div
                      className={`highlight-mask__highlight discourse-highlight highlight-${d.id}`}
                      onMouseEnter={() => {
                        this.markHighlightAsHovered(d);
                        logger.log("debug", "hover-highlight", {
                          discourse: d,
                        });
                      }}
                      onMouseLeave={this.clearAllHovered}
                      onMouseDown={(event: React.MouseEvent) => {
                        this.onClickSentence(event, d, j);
                      }}
                      style={{
                        position: "absolute",
                        left: b.left * width,
                        top: b.top * height,
                        width: b.width * width,
                        height: b.height * height * 1.2,
                        backgroundColor: d.color,
                        opacity: opacity,
                      }}
                    />
                  </Tooltip>
                </React.Fragment>
              ))
          )}

        {showControlToolbar &&
          focusedDiscourseObj &&
          tooltipX !== null &&
          tooltipY !== null && (
            <DiscourseControlToolbar
              x={tooltipX}
              y={tooltipY}
              label={focusedDiscourseObj.label}
              drawerOpen={drawerOpen}
              handleClose={this.closeControlToolbar}
              handleDeleteHighlight={() =>
                this.props.handleHideDiscourseObj(focusedDiscourseObj)
              }
              handleOpenDrawer={() => {
                this.props.handleOpenDrawer();
                setTimeout(() => {
                  if (this.state.focusedDiscourseObj !== null) {
                    this.props.selectSnippetInDrawer(
                      this.state.focusedDiscourseObj
                    );
                  }
                }, 300);
              }}
              handleCloseDrawer={this.props.handleCloseDrawer}
              handleFilterToDiscourse={() =>
                this.props.handleFilterToDiscourse(focusedDiscourseObj.label)
              }
            />
          )}
      </>
    );
  }
}

export default HighlightLayer;
