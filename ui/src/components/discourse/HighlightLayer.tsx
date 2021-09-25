import React from "react";
import { BoundingBox, DiscourseObj, SentenceUnit } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import DiscourseControlToolbar from "./DiscourseControlToolbar";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
  leadSentences: SentenceUnit[];
  opacity: number;
  drawerOpen: boolean;
  handleHideDiscourseObj: (d: DiscourseObj) => void;
  handleOpenDrawer: () => void;
}

interface State {
  showControlToolbar: boolean;
  focusedDiscourseObj: DiscourseObj | null;
}

class HighlightLayer extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showControlToolbar: false,
      focusedDiscourseObj: null,
    };
  }

  closeControlToolbar = () => {
    this.setState({
      showControlToolbar: false,
      focusedDiscourseObj: null,
    });
  };

  showControlToolbar = (d: DiscourseObj) => {
    this.setState({
      showControlToolbar: true,
      focusedDiscourseObj: d,
    })
  }

  toggleControlToolbar = (d: DiscourseObj) => {
    if (this.state.focusedDiscourseObj !== d) {
      this.showControlToolbar(d);
    } else {
      this.closeControlToolbar();
    }
  };

  scrollToSnippetInDrawer = (focusedDiscourseObj: DiscourseObj) => {
    const prevScrolledTo = document.querySelectorAll(".scrolled-to");
    prevScrolledTo.forEach((x) => x.classList.remove("scrolled-to"));

    let retries = 0;
    const interval = setInterval(() => {
      const facetSnippet = document.getElementById(
        `facet-snippet-${focusedDiscourseObj.id}`
      );
      if (facetSnippet !== null) {
        facetSnippet.classList.add("scrolled-to");
        facetSnippet.scrollIntoView({
          block: "center",
        });
      }
      if (retries >= 5) {
        clearInterval(interval);
      }
      retries += 1;
    }, 200);
  };

  render() {
    const {
      pageView,
      discourseObjs,
      leadSentences,
      opacity,
      drawerOpen,
    } = this.props;
    const { showControlToolbar, focusedDiscourseObj } = this.state;

    const pageNumber = uiUtils.getPageNumber(pageView);
    const { width, height } = uiUtils.getPageViewDimensions(pageView);

    const filteredDiscourseObjs = discourseObjs.filter(
      (d) => d.tagLocation.page === pageNumber
    );

    const filteredLeadSentences = leadSentences.filter((s) =>
      s.bboxes.every((b: BoundingBox) => b.page === pageNumber)
    );

    return (
      <>
        {filteredDiscourseObjs &&
          filteredDiscourseObjs.map((d, i) =>
            d.bboxes.map((b, j) => (
              <React.Fragment key={`highlight-${i}-${j}`}>
                <div
                  className={`highlight-mask__highlight discourse-highlight highlight-${d.id}`}
                  onMouseDown={() => {
                    if (drawerOpen) {
                      this.scrollToSnippetInDrawer(d);
                    }
                    this.toggleControlToolbar(d);
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
        {showControlToolbar && focusedDiscourseObj && (
          <DiscourseControlToolbar
            pageView={pageView}
            anchor={focusedDiscourseObj!.tagLocation}
            handleClose={this.closeControlToolbar}
            handleDeleteHighlight={() =>
              this.props.handleHideDiscourseObj(focusedDiscourseObj)
            }
            handleOpenDrawer={() => {
              this.props.handleOpenDrawer();
              this.scrollToSnippetInDrawer(focusedDiscourseObj);
            }}
          />
        )}
      </>
    );
  }
}

export default HighlightLayer;
