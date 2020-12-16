import { PDFPageView } from "../../types/pdfjs-viewer";

import React from "react";
import ReactDOM from "react-dom";

interface Props {
  pageView: PDFPageView;
}

/**
 * This component is an overlay, mounted on top PDF pages. If a component needs to be
 * placed on a page in such a way that it scrolls with that page, it might be a good
 * idea to add it to this component.
 *
 * It should be noted that the PDF pages that this component renders into are *not* under
 * the control of React. Because the parent page elements may appear or disappear at any
 * time, this component has a unique life cycle:
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
class PageOverlay extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this._element = document.createElement("div");
    this._element.classList.add("scholar-reader-page-overlay");
  }

  componentDidMount() {
    this.props.pageView.div.appendChild(this._element);
  }

  componentWillUnmount() {
    if (
      document.body.contains(this.props.pageView.div) &&
      this.props.pageView.div.contains(this._element)
    ) {
      this.props.pageView.div.removeChild(this._element);
    }
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this._element);
  }

  private _element: HTMLElement;
}

export default PageOverlay;
