import React from "react";
import ReactDOM from "react-dom";
import CitationAnnotation from "./CitationAnnotation";
import PageMask from "./PageMask";
import {
  Citations,
  MathMls,
  PaperId,
  Papers,
  SelectableEntityType,
  Sentences,
  Symbols,
} from "./state";
import SymbolAnnotation from "./SymbolAnnotation";
import {
  Annotation as AnnotationObject,
  AnnotationData,
  UserAnnotationType,
  UserLibrary,
} from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import { getPageViewDimensions } from "./ui-utils";
import { UserAnnotationLayer } from "./UserAnnotationLayer";

interface Props {
  paperId?: PaperId;
  pageNumber: number;
  view: PDFPageView;
  papers: Papers | null;
  citations: Citations | null;
  symbols: Symbols | null;
  mathMls: MathMls | null;
  sentences: Sentences | null;
  userLibrary: UserLibrary | null;
  selectedEntityId: string | null;
  selectedEntityType: SelectableEntityType;
  selectedAnnotationId: string | null;
  selectedAnnotationSpanId: string | null;
  showAnnotations: boolean;
  userAnnotations: AnnotationObject[] | null;
  userAnnotationsEnabled: boolean;
  userAnnotationType: UserAnnotationType;
  handleSelectEntity: (entityType: SelectableEntityType, id: string) => void;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  handleAddUserAnnotation: (data: AnnotationData) => void;
  handleUpdateUserAnnotation: (
    id: string,
    annotation: AnnotationObject
  ) => void;
  handleDeleteUserAnnotation: (id: string) => void;
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
class PageOverlay extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this._element = document.createElement("div");
    this._element.classList.add("scholar-reader-page-overlay");
    this.handleSelectSymbol = this.handleSelectSymbol.bind(this);
    this.handleSelectCitation = this.handleSelectCitation.bind(this);
  }

  componentDidMount() {
    this.props.view.div.appendChild(this._element);
  }

  componentWillUnmount() {
    if (
      document.body.contains(this.props.view.div) &&
      this.props.view.div.contains(this._element)
    ) {
      this.props.view.div.removeChild(this._element);
    }
  }

  handleSelectCitation(id: string) {
    this.props.handleSelectEntity("citation", id);
  }

  handleSelectSymbol(id: string) {
    this.props.handleSelectEntity("symbol", id);
  }

  render() {
    const {
      view,
      pageNumber,
      papers,
      citations,
      symbols,
      mathMls,
      sentences,
      userLibrary,
      selectedEntityType,
      selectedEntityId,
      selectedAnnotationId,
      selectedAnnotationSpanId,
      showAnnotations,
      userAnnotations,
      userAnnotationsEnabled,
      userAnnotationType,
      handleAddPaperToLibrary,
      handleSelectAnnotation,
      handleSelectAnnotationSpan,
      handleAddUserAnnotation,
      handleUpdateUserAnnotation,
      handleDeleteUserAnnotation,
    } = this.props;

    /*
     * If user annotations are enabled, the overlay needs to be set to the full size of the page
     * so that it can capture mouse events. If not, the overlay should not have any size, as
     * the layers below (e.g., the text layer) need to capture the mouse events.
     */
    if (userAnnotationsEnabled) {
      this._element.classList.add("user-annotations-enabled");
    } else {
      this._element.classList.remove("user-annotations-enabled");
    }

    const pageDimensions = getPageViewDimensions(this.props.view);
    return ReactDOM.createPortal(
      <>
        <PageMask
          key="page-mask"
          pageNumber={this.props.pageNumber}
          pageWidth={pageDimensions.width}
          pageHeight={pageDimensions.height}
          symbols={symbols}
          mathMls={mathMls}
          sentences={sentences}
          selectedEntityId={selectedEntityId}
          selectedEntityType={selectedEntityType}
        />
        {/* Add annotations for all citation bounding boxes on this page. */}
        {citations !== null && papers !== null
          ? citations.all.map((cId) => {
              const citation = citations.byId[cId];
              const boundingBoxes = citation.bounding_boxes.filter(
                (b) => b.page === this.props.pageNumber - 1
              );
              const isSelected = cId === selectedEntityId;
              return boundingBoxes.length > 0 ? (
                <CitationAnnotation
                  key={cId}
                  pageView={view}
                  paper={papers[citation.paper]}
                  userLibrary={userLibrary}
                  citation={citation}
                  selected={isSelected}
                  selectedSpanId={isSelected ? selectedAnnotationSpanId : null}
                  showHint={showAnnotations}
                  boundingBoxes={boundingBoxes}
                  openedPaperId={this.props.paperId}
                  handleSelectCitation={this.handleSelectCitation}
                  handleAddPaperToLibrary={handleAddPaperToLibrary}
                  handleSelectAnnotation={handleSelectAnnotation}
                  handleSelectAnnotationSpan={handleSelectAnnotationSpan}
                />
              ) : null;
            })
          : null}
        {/* Add annotations for all symbol bounding boxes on this page. */}
        {symbols !== null
          ? symbols.all.map((sId) => {
              const symbol = symbols.byId[sId];
              const boundingBoxes = symbol.bounding_boxes.filter(
                (b) => b.page === this.props.pageNumber - 1
              );
              const isSelected = sId === selectedEntityId;
              return boundingBoxes.length > 0 ? (
                <SymbolAnnotation
                  key={sId}
                  pageView={view}
                  selected={isSelected}
                  selectedSpanId={isSelected ? selectedAnnotationSpanId : null}
                  showHint={showAnnotations}
                  boundingBoxes={boundingBoxes}
                  symbol={symbol}
                  handleSelectSymbol={this.handleSelectSymbol}
                  handleSelectAnnotation={handleSelectAnnotation}
                  handleSelectAnnotationSpan={handleSelectAnnotationSpan}
                />
              ) : null;
            })
          : null}
        {/* Add layer for user annotations. */}
        {userAnnotationsEnabled && userAnnotations !== null ? (
          <UserAnnotationLayer
            pageView={view}
            pageNumber={pageNumber}
            annotations={userAnnotations}
            annotationType={userAnnotationType}
            selectedAnnotationId={selectedAnnotationId}
            selectedAnnotationSpanId={selectedAnnotationSpanId}
            handleSelectAnnotation={handleSelectAnnotation}
            handleSelectAnnotationSpan={handleSelectAnnotationSpan}
            handleAddAnnotation={handleAddUserAnnotation}
            handleUpdateAnnotation={handleUpdateUserAnnotation}
            handleDeleteAnnotation={handleDeleteUserAnnotation}
          />
        ) : null}
      </>,
      this._element
    );
  }

  private _element: HTMLElement;
}

export default PageOverlay;
