import React from "react";
import ReactDOM from "react-dom";
import CitationAnnotation from "./CitationAnnotation";
import PageMask from "./PageMask";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import SymbolAnnotation from "./SymbolAnnotation";
import { PDFPageView } from "./types/pdfjs-viewer";
import { getPageViewDimensions } from "./ui-utils";
import { UserAnnotationLayer } from "./UserAnnotationLayer";
import { Sentence } from "./types/api";

interface PageProps {
  pageNumber: number;
  view: PDFPageView;
  matchingSentences: Array<Sentence>;
}

/**
 * This component is an overlay, mounted on top PDF pages, which are *not* under the control of
 * React. Because the parent page elements may appear or disappear at any time, this component
 * has a unique structure. Its life cycle is:
 *
 * 1. Constructor: create element
 * 2. componentDidMount: append element to PDF page (which is not controlled by React).
 * 3. componentWillUnmount: if the parent PDF page still exists, remove the element. Unmount
 *    events should be triggered whenever a page is re-rendered, as the components that create
 *    this overlay should stop re-rendering this overlay.
 * 4. render: add child elements (e.g., citation annotations) to the overlay.
 *
 * The structure of this class is based on the example at https://reactjs.org/docs/portals.html.
 */
class PageOverlay extends React.PureComponent<PageProps, {}> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  constructor(props: PageProps) {
    super(props);
    this._element = document.createElement("div");
    this._element.classList.add("scholar-reader-overlay");
  }

  componentDidMount() {
    this.props.view.div.appendChild(this._element);
  }

  componentWillUnmount() {
    /**
     * XXX(andrewhead): this 'document.body.contains' might be expensive.
     */
    if (
      document.body.contains(this.props.view.div) &&
      this.props.view.div.contains(this._element)
    ) {
      this.props.view.div.removeChild(this._element);
    }
  }

  render() {
    /*
     * If user annotations are enabled, the overlay needs to be set to the full size of the page
     * so that it can capture mouse events. If not, the overlay should not have any size, as
     * the layers below (e.g., the text layer) need to capture the mouse events.
     * TODO: set width and height to 100% only if annotations enabled.
     */
    if (this.context.userAnnotationsEnabled) {
      this._element.classList.add("user-annotations-enabled");
    } else {
      this._element.classList.remove("user-annotations-enabled");
    }

    /*
     * Assemble a list of symbols that should highlighted based on the currently selected entity.
     */
    const highlightedSymbols: string[] = [];
    if (
      this.context.symbols !== null &&
      this.context.mathMls !== null &&
      this.context.selectedEntityType === "symbol" &&
      this.context.selectedEntityId !== null
    ) {
      highlightedSymbols.push(
        ...selectors.matchingSymbols(
          this.context.selectedEntityId,
          this.context.symbols,
          this.context.mathMls
        )
      );
    }

    const pageDimensions = getPageViewDimensions(this.props.view);
    return ReactDOM.createPortal(
      <ScholarReaderContext.Consumer>
        {({
          citations,
          symbols,
          annotationsShowing,
          userAnnotationsEnabled
        }) => {
          return (
            <>
              <PageMask
                key="page-mask"
                pageNumber={this.props.pageNumber}
                pageWidth={pageDimensions.width}
                pageHeight={pageDimensions.height}
                matchingSentences={this.props.matchingSentences}
              />
              {/* Add annotations for all citation bounding boxes on this page. */}
              {citations !== null
                ? citations.all.map(cId => {
                    const citation = citations.byId[cId];
                    const boundingBoxes = citation.bounding_boxes.filter(
                      b => b.page === this.props.pageNumber - 1
                    );
                    return boundingBoxes.length > 0 ? (
                      <CitationAnnotation
                        key={cId}
                        showHint={annotationsShowing}
                        boundingBoxes={boundingBoxes}
                        citation={citation}
                      />
                    ) : null;
                  })
                : null}
              {/* Add annotations for all symbol bounding boxes on this page. */}
              {symbols !== null
                ? symbols.all.map(sId => {
                    const symbol = symbols.byId[sId];
                    const boundingBoxes = symbol.bounding_boxes.filter(
                      b => b.page === this.props.pageNumber - 1
                    );
                    return boundingBoxes.length > 0 ? (
                      <SymbolAnnotation
                        key={sId}
                        showHint={annotationsShowing}
                        boundingBoxes={boundingBoxes}
                        symbol={symbol}
                        highlight={highlightedSymbols.indexOf(sId) !== -1}
                      />
                    ) : null;
                  })
                : null}
              {/* Add layer for user annotations. */}
              {userAnnotationsEnabled && (
                <UserAnnotationLayer
                  pageView={this.props.view}
                  pageNumber={this.props.pageNumber}
                />
              )}
            </>
          );
        }}
      </ScholarReaderContext.Consumer>,
      this._element
    );
  }

  private _element: HTMLElement;
}

export default PageOverlay;
