import React from "react";
import ReactDOM from "react-dom";
import CitationAnnotation from "./CitationAnnotation";
import EntityCreationCanvas from "./EntityCreationCanvas";
import PageMask from "./PageMask";
import * as selectors from "./selectors";
import SentenceAnnotation from "./SentenceAnnotation";
import {
  Entities,
  KnownEntityType,
  PaperId,
  Papers,
  UserLibrary,
} from "./state";
import SymbolAnnotation from "./SymbolAnnotation";
import TermAnnotation from "./TermAnnotation";
import {
  EntityCreateData,
  EntityUpdateData,
  isCitation,
  isSentence,
  isSymbol,
  isTerm,
} from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import { getPageViewDimensions } from "./utils/ui";

interface Props {
  paperId?: PaperId;
  pageNumber: number;
  view: PDFPageView;
  papers: Papers | null;
  entities: Entities | null;
  userLibrary: UserLibrary | null;
  selectedEntityId: string | null;
  selectedAnnotationId: string | null;
  selectedAnnotationSpanId: string | null;
  findMatchedEntityIds: string[] | null;
  findSelectionEntityId: string | null;
  showAnnotations: boolean;
  entityCreationEnabled: boolean;
  entityCreationType: KnownEntityType | null;
  entityEditingEnabled: boolean;
  handleSelectEntity: (id: string) => void;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
  handleShowSnackbarMessage: (message: string) => void;
  handleStartSymbolSearch: (id: string) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  handleCreateEntity: (entity: EntityCreateData) => Promise<boolean>;
  handleUpdateEntity: (data: EntityUpdateData) => Promise<boolean>;
  handleDeleteEntity: (id: string) => Promise<boolean>;
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

  render() {
    const {
      paperId,
      view,
      pageNumber,
      papers,
      entities,
      userLibrary,
      selectedEntityId,
      selectedAnnotationId,
      selectedAnnotationSpanId,
      findMatchedEntityIds,
      findSelectionEntityId,
      showAnnotations,
      entityCreationEnabled,
      entityCreationType,
      entityEditingEnabled,
      handleAddPaperToLibrary,
      handleStartSymbolSearch,
      handleSelectAnnotation,
      handleSelectAnnotationSpan,
      handleCreateEntity,
    } = this.props;

    const pageDimensions = getPageViewDimensions(view);

    return ReactDOM.createPortal(
      <>
        <PageMask
          key="page-mask"
          pageNumber={pageNumber}
          pageWidth={pageDimensions.width}
          pageHeight={pageDimensions.height}
          entities={entities}
          selectedEntityId={selectedEntityId}
        />
        {/* Add annotations for all citation bounding boxes on this page. */}
        {entities !== null
          ? entities.all.map((entityId) => {
              const entity = entities.byId[entityId];
              const annotationId = `entity-${entityId}-page-${pageNumber}-annotation`;
              const isSelected = annotationId === selectedAnnotationId;
              const boundingBoxes = entity.attributes.bounding_boxes.filter(
                (box) => box.page === pageNumber - 1
              );
              if (isTerm(entity)) {
                return (
                  <TermAnnotation
                    key={annotationId}
                    id={annotationId}
                    pageView={view}
                    term={entity}
                    boundingBoxes={boundingBoxes}
                    active={showAnnotations}
                    selected={isSelected}
                    selectedSpanId={
                      isSelected ? selectedAnnotationSpanId : null
                    }
                    handleSelect={handleSelectAnnotation}
                    handleSelectSpan={handleSelectAnnotationSpan}
                    handleSelectEntity={this.props.handleSelectEntity}
                  />
                );
              }
              if (isCitation(entity) && papers !== null) {
                return (
                  <CitationAnnotation
                    key={annotationId}
                    id={annotationId}
                    pageView={view}
                    userLibrary={userLibrary}
                    citation={entity}
                    paper={
                      entity.attributes.paper_id !== null
                        ? papers[entity.attributes.paper_id] || null
                        : null
                    }
                    boundingBoxes={boundingBoxes}
                    active={showAnnotations}
                    selected={isSelected}
                    selectedSpanId={
                      isSelected ? selectedAnnotationSpanId : null
                    }
                    openedPaperId={paperId}
                    handleSelect={handleSelectAnnotation}
                    handleSelectSpan={handleSelectAnnotationSpan}
                    handleSelectEntity={this.props.handleSelectEntity}
                    handleAddPaperToLibrary={handleAddPaperToLibrary}
                  />
                );
              } else if (isSymbol(entity)) {
                const isFindMatch =
                  findMatchedEntityIds !== null &&
                  findMatchedEntityIds.indexOf(entityId) !== -1;
                return (
                  <SymbolAnnotation
                    key={annotationId}
                    id={annotationId}
                    pageView={view}
                    boundingBoxes={boundingBoxes}
                    /*
                     * Only show interactivity for top-level symbols (i.e., symbols that are
                     * not children of other symbols).
                     */
                    active={
                      showAnnotations &&
                      selectors.isSymbolTopLevel(entity, entities)
                    }
                    selected={isSelected}
                    selectedSpanId={
                      isSelected ? selectedAnnotationSpanId : null
                    }
                    isFindSelection={findSelectionEntityId === entityId}
                    isFindMatch={isFindMatch}
                    symbol={entity}
                    handleSelect={handleSelectAnnotation}
                    handleSelectAnnotationSpan={handleSelectAnnotationSpan}
                    handleSelectEntity={this.props.handleSelectEntity}
                    handleStartSymbolSearch={handleStartSymbolSearch}
                  />
                );
              } else if (entityEditingEnabled && isSentence(entity)) {
                return (
                  <SentenceAnnotation
                    key={annotationId}
                    id={annotationId}
                    pageView={view}
                    sentence={entity}
                    boundingBoxes={boundingBoxes}
                    active={showAnnotations}
                    selected={isSelected}
                    selectedSpanId={
                      isSelected ? selectedAnnotationSpanId : null
                    }
                    handleSelect={handleSelectAnnotation}
                    handleSelectSpan={handleSelectAnnotationSpan}
                    handleSelectEntity={this.props.handleSelectEntity}
                    handleShowSnackbarMessage={
                      this.props.handleShowSnackbarMessage
                    }
                  />
                );
              } else {
                return null;
              }
            })
          : null}
        {/* Add layer for user annotations. */}
        {entityCreationEnabled && entityCreationType !== null ? (
          <EntityCreationCanvas
            pageView={view}
            pageNumber={pageNumber}
            entityType={entityCreationType}
            handleShowSnackbarMessage={this.props.handleShowSnackbarMessage}
            handleCreateEntity={handleCreateEntity}
          />
        ) : null}
      </>,
      this._element
    );
  }

  private _element: HTMLElement;
}

export default PageOverlay;
