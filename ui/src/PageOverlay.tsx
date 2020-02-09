import React from "react";
import ReactDOM from "react-dom";
import CitationAnnotation from "./CitationAnnotation";
import { Point } from "./Selection";
import SelectionCanvas from "./SelectionLayer";
import { ScholarReaderContext } from "./state";
import SymbolAnnotation from "./SymbolAnnotation";
import { AnnotationData } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import UserAnnotation from "./UserAnnotation";

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

  onSelectionMade(anchor: Point, active: Point) {
    const { addUserAnnotation, userAnnotationType } = this.context;
    addUserAnnotation(
      selectionToAnnotation(this.props.view, anchor, active, userAnnotationType)
    );
  }

  render() {
    /**
     * If user annotations are enabled, the overlay needs to be set to the full size of the page
     * so that it can capture mouse events. If not, the overlay should not have any size, as
     * the layers below (e.g., the text layer) need to capture the mouse events.
     */
    if (this.context.userAnnotationsEnabled) {
      this._element.style.width = this.props.view.div.style.width;
      this._element.style.height = this.props.view.div.style.height;
    } else {
      this._element.style.width = "0px";
      this._element.style.height = "0px";
    }

    return ReactDOM.createPortal(
      <ScholarReaderContext.Consumer>
        {({
          citations,
          symbols,
          annotationsShowing,
          userAnnotationsEnabled,
          userAnnotations
        }) => {
          const localizedCitations = citations.filter(
            c => c.bounding_boxes[0].page === this.props.pageNumber - 1
          );
          const localizedSymbols = symbols.filter(
            s => s.bounding_boxes[0].page === this.props.pageNumber - 1
          );
          const localizedUserAnnotations = userAnnotations.filter(
            a => a.boundingBox.page === this.props.pageNumber - 1
          );
          return (
            <>
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
                <>
                  <SelectionCanvas
                    key="selection-canvas"
                    onSelection={this.onSelectionMade.bind(this)}
                  />
                  {localizedUserAnnotations.map(a => (
                    <UserAnnotation
                      key={`user-annotation-${a.id}`}
                      annotation={a}
                    />
                  ))}
                </>
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

function selectionToAnnotation(
  pageView: PDFPageView,
  anchor: Point,
  active: Point,
  type?: "citation" | "symbol"
): AnnotationData {
  const viewport = pageView.viewport;
  const [anchorPdfX, anchorPdfY] = viewport.convertToPdfPoint(
    anchor.x,
    anchor.y
  );
  const [activePdfX, activePdfY] = viewport.convertToPdfPoint(
    active.x,
    active.y
  );

  const page = pageView.pdfPage.pageNumber - 1;
  const left = Math.min(anchorPdfX, activePdfX);
  const top = Math.max(anchorPdfY, activePdfY);
  const width = Math.abs(activePdfX - anchorPdfX);
  const height = Math.abs(activePdfY - anchorPdfY);

  return {
    type: type || "citation",
    page,
    left,
    top,
    width,
    height
  };
}

export default PageOverlay;
