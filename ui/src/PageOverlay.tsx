import React from "react";
import ReactDOM from "react-dom";
import CitationAnnotation from "./CitationAnnotation";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import SymbolAnnotation from "./SymbolAnnotation";
import { PDFPageView } from "./types/pdfjs-viewer";

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
class PageOverlay extends React.Component<PageProps, {}> {
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
    return ReactDOM.createPortal(
      <ScholarReaderContext.Consumer>
        {({ citations, symbols }) => {
          const localizedCitations = selectors.boxEntityPairsForPage(
            [...citations],
            this.props.pageNumber
          );
          const localizedSymbols = symbols.filter(
            s => s.bounding_box.page === this.props.pageNumber - 1
          );
          return (
            <>
              {localizedCitations.map(c => (
                <CitationAnnotation
                  key={selectors.citationKey(c.citation, c.boundingBox)}
                  location={c.boundingBox}
                  citation={c.citation}
                  pageView={this.props.view}
                />
              ))}
              {localizedSymbols.map(s => (
                <SymbolAnnotation
                  key={s.id}
                  location={s.bounding_box}
                  symbol={s}
                  pageView={this.props.view}
                />
              ))}
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
