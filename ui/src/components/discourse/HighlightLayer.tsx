import React from "react";
import { BoundingBox, DiscourseObj, SentenceUnit } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import DiscourseControlToolbar from "./DiscourseControlToolbar";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
  leadSentences: SentenceUnit[] | null;
  opacity: number;
  drawerOpen: boolean;
  handleDiscourseObjSelected: (d: DiscourseObj) => void;
  handleHideDiscourseObj: (d: DiscourseObj) => void;
  handleOpenDrawer: () => void;
  handleCloseDrawer: () => void;
  handleFilterToDiscourse: (discourse: string) => void;
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
      this.closeControlToolbar();
      this.clearAllSelected();
    }
  };

  onClickSentence = (
    event: React.MouseEvent,
    sentence: DiscourseObj,
    lineIndex: number
  ) => {
    const pageRect = this.props.pageView.div.getBoundingClientRect();
    this.clearAllSelected();
    this.props.handleDiscourseObjSelected(sentence);
    this.markHighlightAsSelected(sentence);
    this.selectSnippetInDrawer(sentence);
    this.setState({
      showControlToolbar: true,
      focusedDiscourseObj: sentence,
      clickedLineBox: sentence.bboxes[lineIndex],
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

  componentDidUpdate = () => {
    /*
     * When the selected sentence changes, scroll the drawer to the
     * newly selected sentence.
     */
    // this.selectSnippetInDrawer(this.state.focusedDiscourseObj);
  };

  selectSnippetInDrawer = (selection: DiscourseObj | null) => {
    let elementToSelectClass;
    if (selection !== null) {
      elementToSelectClass = `facet-snippet-${selection.id}`;
    }

    const prevScrolledTo = document.querySelectorAll(".scrolled-to");
    if (prevScrolledTo.length > 0) {
      /*
       * If the element is already selected, do nothing.
       */
      if (
        elementToSelectClass !== undefined &&
        prevScrolledTo[0].classList.contains(elementToSelectClass)
      ) {
        return;
      }
      /*
       * Otherwise, deselect currently selected elements.
       */
      prevScrolledTo.forEach((x) => x.classList.remove("scrolled-to"));
    }

    if (elementToSelectClass !== undefined) {
      this.clearAllSelected();
      const facetSnippet = document.querySelector(`.${elementToSelectClass}`);
      if (facetSnippet !== null) {
        facetSnippet.classList.add("selected");
        facetSnippet.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }
    }
  };

  render() {
    const {
      pageView,
      discourseObjs,
      leadSentences,
      opacity,
      drawerOpen,
    } = this.props;
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

    const filteredDiscourseObjs = discourseObjs.filter(
      (d) => d.tagLocation.page === pageNumber
    );

    let filteredLeadSentences: SentenceUnit[] = [];
    if (leadSentences !== null) {
      filteredLeadSentences = leadSentences.filter((s) =>
        s.bboxes.every((b: BoundingBox) => b.page === pageNumber)
      );
    }

    return (
      <>
        {filteredDiscourseObjs &&
          filteredDiscourseObjs.map((d, i) =>
            d.bboxes.map((b, j) => (
              <React.Fragment key={`highlight-${i}-${j}`}>
                <div
                  className={`highlight-mask__highlight discourse-highlight highlight-${d.id}`}
                  onMouseEnter={() => this.markHighlightAsHovered(d)}
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
              </React.Fragment>
            ))
          )}
        {filteredLeadSentences &&
          filteredLeadSentences.map((s, i) =>
            s.bboxes.map((b, j) => (
              <React.Fragment key={`highlight-${i}-${j}`}>
                <div
                  className={`highlight-mask__highlight highlight-${i}`}
                  style={{
                    position: "absolute",
                    left: b.left * width,
                    top: b.top * height,
                    width: b.width * width,
                    height: b.height * height,
                    backgroundColor: "#F1E740",
                    opacity: 0.25,
                  }}
                />
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
                  this.selectSnippetInDrawer(this.state.focusedDiscourseObj);
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
