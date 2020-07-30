import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import CitationGloss from "./CitationGloss";
import EntityAnnotation from "./EntityAnnotation";
import EntityCreationCanvas from "./EntityCreationCanvas";
import { AreaSelectionMethod } from "./EntityCreationToolbar";
import PageMask from "./PageMask";
import * as selectors from "./selectors";
import { GlossStyle } from "./settings";
import {
  Entities,
  KnownEntityType,
  PaperId,
  Papers,
  UserLibrary,
} from "./state";
import SymbolDefinitionGloss from "./SymbolDefinitionGloss";
import SymbolPropertyEvaluationGloss from "./SymbolPropertyEvaluationGloss";
import TermDefinitionGloss from "./TermDefinitionGloss";
import TermPropertyEvaluationGloss from "./TermPropertyEvaluationGloss";
import {
  Entity,
  EntityCreateData,
  isCitation,
  isSentence,
  isSymbol,
  isTerm,
} from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

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
  pageMaskShowing: boolean;
  glossStyle: GlossStyle;
  glossEvaluationEnabled: boolean;
  entityCreationEnabled: boolean;
  entityCreationType: KnownEntityType;
  entityCreationAreaSelectionMethod: AreaSelectionMethod;
  copySentenceOnClick: boolean;
  handleSelectEntityAnnotation: (
    entityId: string,
    annotationId: string,
    spanId: string
  ) => void;
  handleShowSnackbarMessage: (message: string) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  handleCreateEntity: (entity: EntityCreateData) => Promise<string | null>;
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
    this.onClickSentence = this.onClickSentence.bind(this);
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

  onClickSentence(
    event: React.MouseEvent<HTMLDivElement>,
    sentenceEntity: Entity
  ) {
    if (event.altKey && isSentence(sentenceEntity)) {
      const { tex } = sentenceEntity.attributes;
      if (tex !== null) {
        navigator.clipboard.writeText(tex);
        const texPreview = uiUtils.truncateText(tex, 30, true);
        this.props.handleShowSnackbarMessage(
          `Copied LaTeX for sentence to clipboard: "${texPreview}"`
        );
      }
      /*
       * Tell the Annotation that the click event has been handled; don't select this sentence.
       */
      return true;
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
      pageMaskShowing,
      showAnnotations,
      glossStyle,
      glossEvaluationEnabled,
      entityCreationEnabled,
      entityCreationType,
      entityCreationAreaSelectionMethod,
      copySentenceOnClick: copySentenceOnOptionClick,
      handleAddPaperToLibrary,
      handleCreateEntity,
      handleSelectEntityAnnotation,
    } = this.props;

    const pageDimensions = uiUtils.getPageViewDimensions(view);
    let selectedEntities: Entity[] = [];
    if (entities !== null) {
      selectedEntities = selectedEntityIds.map((id) => entities.byId[id]);
    }

    return ReactDOM.createPortal(
      <>
        {!entityCreationEnabled && pageMaskShowing ? (
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
              const selectedSpanIds = isSelected
                ? selectedAnnotationSpanIds
                : null;
              if (isTerm(entity)) {
                return (
                  <EntityAnnotation
                    key={annotationId}
                    id={annotationId}
                    entity={entity}
                    className="term-annotation"
                    pageView={view}
                    pageNumber={pageNumber}
                    underline={showAnnotations}
                    glossStyle={glossStyle}
                    glossContent={
                      glossEvaluationEnabled ? (
                        <TermPropertyEvaluationGloss
                          id={annotationId}
                          term={entity}
                        />
                      ) : (
                        <TermDefinitionGloss term={entity} />
                      )
                    }
                    selected={isSelected}
                    selectedSpanIds={selectedSpanIds}
                    handleSelect={handleSelectEntityAnnotation}
                  />
                );
              } else if (
                isCitation(entity) &&
                papers !== null &&
                entity.attributes.paper_id !== null &&
                papers[entity.attributes.paper_id] !== undefined
              ) {
                return (
                  <EntityAnnotation
                    key={annotationId}
                    id={annotationId}
                    entity={entity}
                    className="citation-annotation"
                    pageView={view}
                    pageNumber={pageNumber}
                    underline={showAnnotations}
                    glossStyle={glossStyle}
                    glossContent={
                      <CitationGloss
                        citation={entity}
                        paper={papers[entity.attributes.paper_id]}
                        userLibrary={userLibrary}
                        handleAddPaperToLibrary={handleAddPaperToLibrary}
                        openedPaperId={paperId}
                      />
                    }
                    selected={isSelected}
                    selectedSpanIds={selectedSpanIds}
                    handleSelect={handleSelectEntityAnnotation}
                  />
                );
              } else if (isSymbol(entity)) {
                const isMatch =
                  findMatchedEntityIds !== null &&
                  findMatchedEntityIds.indexOf(entityId) !== -1;
                const parentId = entity.relationships.parent.id;
                const isTopLevelSymbol =
                  parentId === null || entities.byId[parentId] === undefined;
                const isSelectionChild = selectedEntities.some(
                  (e) => isSymbol(e) && selectors.isChild(entity, e)
                );
                const isSelectionAncestor = selectedEntities.some(
                  (e) =>
                    isSymbol(e) && selectors.isDescendant(e, entity, entities)
                );
                const isLeaf = entity.relationships.children.length === 0;
                const descendants = selectors.descendants(entity.id, entities);
                return (
                  <EntityAnnotation
                    key={annotationId}
                    id={annotationId}
                    className={classNames("symbol-annotation", {
                      "child-of-selection": isSelectionChild,
                      "leaf-symbol": isLeaf,
                      "ancestor-of-selection": isSelectionAncestor,
                    })}
                    pageView={view}
                    pageNumber={pageNumber}
                    entity={entity}
                    /*
                     * Support selection of:
                     * 1. Top-level symbols (i.e., those that aren't children of others)
                     * 2. The children of a selected symbol, to allow selection refinement
                     * To allow the descendants of a selected symbol to be selectable, a selected
                     * symbol (once selected) should no longer be interactive itself.
                     */
                    active={
                      (isTopLevelSymbol &&
                        !isSelectionAncestor &&
                        !isSelected) ||
                      isSelectionChild ||
                      (isLeaf && isSelected)
                    }
                    underline={showAnnotations}
                    selected={isSelected}
                    selectedSpanIds={selectedSpanIds}
                    isFindSelection={findSelectionEntityId === entityId}
                    isFindMatch={isMatch}
                    glossStyle={glossStyle}
                    glossContent={
                      glossEvaluationEnabled ? (
                        <SymbolPropertyEvaluationGloss
                          id={annotationId}
                          symbol={entity}
                          descendants={descendants}
                        />
                      ) : (
                        <SymbolDefinitionGloss symbol={entity} />
                      )
                    }
                    handleSelect={this.props.handleSelectEntityAnnotation}
                  />
                );
              } else if (isSentence(entity)) {
                return (
                  <EntityAnnotation
                    key={annotationId}
                    className="sentence-annotation"
                    id={annotationId}
                    pageView={view}
                    pageNumber={pageNumber}
                    entity={entity}
                    active={copySentenceOnOptionClick}
                    underline={false}
                    selected={false}
                    selectedSpanIds={null}
                    onClick={this.onClickSentence}
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
