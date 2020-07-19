import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import CitationAnnotation from "./CitationAnnotation";
import EntityCreationCanvas from "./EntityCreationCanvas";
import { AreaSelectionMethod } from "./EntityCreationToolbar";
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
  Entity,
  EntityCreateData,
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
  selectedEntityIds: string[];
  selectedAnnotationIds: string[];
  selectedAnnotationSpanIds: string[];
  findMatchedEntityIds: string[] | null;
  findSelectionEntityId: string | null;
  showAnnotations: boolean;
  entityCreationEnabled: boolean;
  entityCreationType: KnownEntityType;
  entityCreationAreaSelectionMethod: AreaSelectionMethod;
  entityEditingEnabled: boolean;
  copySentenceOnClick: boolean;
  handleSelectEntityAnnotation: (
    entityId: string,
    annotationId: string,
    spanId: string
  ) => void;
  handleShowSnackbarMessage: (message: string) => void;
  handleStartSymbolSearch: (id: string) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  handleCreateEntity: (entity: EntityCreateData) => Promise<boolean>;
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
      selectedEntityIds,
      selectedAnnotationIds,
      selectedAnnotationSpanIds,
      findMatchedEntityIds,
      findSelectionEntityId,
      showAnnotations,
      entityCreationEnabled,
      entityCreationType,
      entityCreationAreaSelectionMethod,
      entityEditingEnabled,
      copySentenceOnClick,
      handleAddPaperToLibrary,
      handleStartSymbolSearch,
      handleCreateEntity,
    } = this.props;

    const pageDimensions = getPageViewDimensions(view);
    let selectedEntities: Entity[] = [];
    if (entities !== null) {
      selectedEntities = selectedEntityIds.map((id) => entities.byId[id]);
    }

    return ReactDOM.createPortal(
      <>
        {!entityCreationEnabled ? (
          <PageMask
            key="page-mask"
            pageNumber={pageNumber}
            pageWidth={pageDimensions.width}
            pageHeight={pageDimensions.height}
            entities={entities}
            selectedEntityIds={selectedEntityIds}
          />
        ) : null}
        {/* Add annotations for all citation bounding boxes on this page. */}
        {entities !== null
          ? entities.all.map((entityId) => {
              const entity = entities.byId[entityId];
              const annotationId = `entity-${entityId}-page-${pageNumber}-annotation`;
              const isSelected =
                selectedAnnotationIds.indexOf(annotationId) !== -1;
              const boundingBoxes = entity.attributes.bounding_boxes.filter(
                (box) => box.page === pageNumber - 1
              );
              if (boundingBoxes.length === 0) {
                return null;
              }
              if (isTerm(entity)) {
                return (
                  <TermAnnotation
                    key={annotationId}
                    id={annotationId}
                    pageView={view}
                    pageNumber={pageNumber}
                    term={entity}
                    active={showAnnotations}
                    selected={isSelected}
                    selectedSpanIds={
                      isSelected ? selectedAnnotationSpanIds : null
                    }
                    handleSelect={this.props.handleSelectEntityAnnotation}
                  />
                );
              }
              if (isCitation(entity) && papers !== null) {
                return (
                  <CitationAnnotation
                    key={annotationId}
                    id={annotationId}
                    pageView={view}
                    pageNumber={pageNumber}
                    userLibrary={userLibrary}
                    citation={entity}
                    paper={
                      entity.attributes.paper_id !== null
                        ? papers[entity.attributes.paper_id] || null
                        : null
                    }
                    active={showAnnotations}
                    selected={isSelected}
                    selectedSpanIds={
                      isSelected ? selectedAnnotationSpanIds : null
                    }
                    openedPaperId={paperId}
                    handleSelect={this.props.handleSelectEntityAnnotation}
                    handleAddPaperToLibrary={handleAddPaperToLibrary}
                  />
                );
              } else if (isSymbol(entity)) {
                const isFindMatch =
                  findMatchedEntityIds !== null &&
                  findMatchedEntityIds.indexOf(entityId) !== -1;
                const isTopLevelSymbol =
                  entity.relationships.parent.id === null;
                const isChildOfSelection = selectedEntities.some(
                  (e) => isSymbol(e) && selectors.isChild(entity, e)
                );
                const isAncestorOfSelection = selectedEntities.some(
                  (e) =>
                    isSymbol(e) && selectors.isDescendant(e, entity, entities)
                );
                const isLeaf = entity.relationships.children.length === 0;
                return (
                  <SymbolAnnotation
                    key={annotationId}
                    id={annotationId}
                    className={classNames({
                      "child-of-selection": isChildOfSelection,
                      "leaf-symbol": isLeaf,
                      "ancestor-of-selection": isAncestorOfSelection,
                    })}
                    pageView={view}
                    pageNumber={pageNumber}
                    symbol={entity}
                    /*
                     * Support selection of:
                     * 1. Top-level symbols (i.e., those that aren't children of others)
                     * 2. The children of a selected symbol, to allow selection refinement
                     * To allow the descendants of a selected symbol to be selectable, a selected
                     * symbol (once selected) should no longer be interactive itself.
                     */
                    active={
                      showAnnotations &&
                      ((isTopLevelSymbol &&
                        !isAncestorOfSelection &&
                        !isSelected) ||
                        isChildOfSelection ||
                        (isLeaf && isSelected))
                    }
                    selected={isSelected}
                    selectedSpanIds={
                      isSelected ? selectedAnnotationSpanIds : null
                    }
                    isFindSelection={findSelectionEntityId === entityId}
                    isFindMatch={isFindMatch}
                    tooltip={entityEditingEnabled ? null : "property-viewer"}
                    handleSelect={this.props.handleSelectEntityAnnotation}
                    handleStartSymbolSearch={handleStartSymbolSearch}
                  />
                );
              } else if (
                entityEditingEnabled &&
                copySentenceOnClick &&
                isSentence(entity)
              ) {
                return (
                  <SentenceAnnotation
                    key={annotationId}
                    id={annotationId}
                    pageView={view}
                    pageNumber={pageNumber}
                    sentence={entity}
                    active={showAnnotations}
                    selected={isSelected}
                    selectedSpanIds={
                      isSelected ? selectedAnnotationSpanIds : null
                    }
                    handleSelect={this.props.handleSelectEntityAnnotation}
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
        {entityCreationEnabled &&
        entityCreationAreaSelectionMethod === "rectangular-selection" ? (
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
