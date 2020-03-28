import React from "react";
import ReactDOM from "react-dom";
import CitationAnnotation from "./CitationAnnotation";
import PageMask from "./PageMask";
import { ScholarReaderContext } from "./state";
import SymbolAnnotation from "./SymbolAnnotation";
import { PDFPageView } from "./types/pdfjs-viewer";
import { UserAnnotationLayer } from "./UserAnnotationLayer";

interface PageProps {
  pageNumber: number;
  view: PDFPageView;
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
     * TODO(andrewhead): this 'document.body.contains' might be expensive.
     */
    if (
      document.body.contains(this.props.view.div) &&
      this.props.view.div.contains(this._element)
    ) {
      this.props.view.div.removeChild(this._element);
    }
  }

  render() {
    /**
     * TODO(andrewhead): change this using 'pointer-events'?
     * If user annotations are enabled, the overlay needs to be set to the full size of the page
     * so that it can capture mouse events. If not, the overlay should not have any size, as
     * the layers below (e.g., the text layer) need to capture the mouse events.
     */
    if (this.context.userAnnotationsEnabled) {
      this._element.style.width = this.props.view.div.style.width;
      this._element.style.height = this.props.view.div.style.height;
    } else {
      // this._element.style.width = "0px";
      // this._element.style.height = "0px";
    }

    return ReactDOM.createPortal(
      <ScholarReaderContext.Consumer>
        {({
          citations,
          symbols,
          annotationsShowing,
          userAnnotationsEnabled
        }) => {
          const localizedCitations = citations.filter(
            c => c.bounding_boxes[0].page === this.props.pageNumber - 1
          );
          const localizedSymbols = symbols
            .filter(s => s.parent === null)
            .filter(
              s => s.bounding_boxes[0].page === this.props.pageNumber - 1
            );
          return (
            <>
              <PageMask
                pageNumber={this.props.pageNumber}
                pageView={this.props.view}
              />
              {localizedCitations.map(c => (
                <CitationAnnotation
                  key={c.id}
                  showHint={annotationsShowing}
                  boundingBoxes={c.bounding_boxes}
                  citation={c}
                />
              ))}
              {localizedSymbols.map(s => (
                <SymbolAnnotation
                  key={s.id}
                  showHint={annotationsShowing}
                  boundingBoxes={s.bounding_boxes}
                  symbol={s}
                />
              ))}
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
