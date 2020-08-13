import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import CitationGloss from "./CitationGloss";
import EntityAnnotation from "./EntityAnnotation";
import EntityCreationCanvas from "./EntityCreationCanvas";
import { AreaSelectionMethod } from "./EntityCreationToolbar";
import EntityPageMask from "./EntityPageMask";
import EquationDiagram from "./EquationDiagram";
import SearchPageMask from "./SearchPageMask";
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
  isEquation,
  isSentence,
  isSymbol,
  isTerm,
} from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  paperId?: PaperId;
  pageView: PDFPageView;
  papers: Papers | null;
  entities: Entities | null;
  userLibrary: UserLibrary | null;
  selectedEntityIds: string[];
  selectedAnnotationIds: string[];
  selectedAnnotationSpanIds: string[];
  findMatchedEntityIds: string[] | null;
  findSelectionEntityId: string | null;
  showAnnotations: boolean;
  searchMaskEnabled: boolean;
  glossStyle: GlossStyle;
  glossEvaluationEnabled: boolean;
  entityCreationEnabled: boolean;
  entityCreationType: KnownEntityType;
  entityCreationAreaSelectionMethod: AreaSelectionMethod;
  equationDiagramsEnabled: boolean;
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
    this.onClickSentence = this.onClickSentence.bind(this);
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
      pageView,
      papers,
      entities,
      userLibrary,
      selectedEntityIds,
      selectedAnnotationIds,
      selectedAnnotationSpanIds,
      findMatchedEntityIds,
      findSelectionEntityId,
      searchMaskEnabled,
      showAnnotations,
      glossStyle,
      glossEvaluationEnabled,
      entityCreationEnabled,
      entityCreationType,
      entityCreationAreaSelectionMethod,
      equationDiagramsEnabled: formulaDiagramsEnabled,
      copySentenceOnClick,
      handleAddPaperToLibrary,
      handleCreateEntity,
      handleSelectEntityAnnotation,
    } = this.props;

    const pageNumber = uiUtils.getPageNumber(pageView);
    let selectedEntities: Entity[] = [];
    if (entities !== null) {
      selectedEntities = selectedEntityIds.map((id) => entities.byId[id]);
    }

    return ReactDOM.createPortal(
      <>
        {!entityCreationEnabled && searchMaskEnabled ? (
          <SearchPageMask
            pageView={pageView}
            entities={entities}
            selectedEntityIds={selectedEntityIds}
          />
        ) : null}
        {!entityCreationEnabled &&
        formulaDiagramsEnabled &&
        entities !== null &&
        selectedEntities.some((e) => e.type === "equation") ? (
          <EntityPageMask
            pageView={pageView}
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
                (box) => box.page === pageNumber
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
                    pageView={pageView}
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
                    pageView={pageView}
                    underline={showAnnotations}
                    glossStyle={glossStyle}
                    glossContent={
                      <CitationGloss
                        citation={entity}
                        paper={papers[entity.attributes.paper_id]}
                        userLibrary={userLibrary}
                        handleAddPaperToLibrary={handleAddPaperToLibrary}
                        openedPaperId={paperId}
                        evaluationEnabled={glossEvaluationEnabled}
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

                /*
                 * Determine what selection hints to show to indicate to the user that the
                 * symbol can be selected.
                 */
                const isTopLevelSymbol =
                  parentId === null || entities.byId[parentId] === undefined;
                const isChildOfSelection = selectedEntities.some(
                  (e) => isSymbol(e) && selectors.isChild(entity, e)
                );
                const isEquationSelected = selectedEntityIds
                  .map((id) => entities.byId[id])
                  .filter((e) => e !== undefined)
                  .filter((e) => isEquation(e))
                  .some((e) => e.id === entity.relationships.equation.id);
                const isSelectable =
                  isChildOfSelection ||
                  (formulaDiagramsEnabled &&
                    isTopLevelSymbol &&
                    isEquationSelected);
                const isAncestorOfSelection = selectedEntities.some(
                  (e) =>
                    isSymbol(e) && selectors.isDescendant(e, entity, entities)
                );
                const isLeaf = entity.relationships.children.length === 0;

                /*
                 * A symbol is interactive when it's a member of a selected equation (if equation
                 * diagrams are enabled), or otherwise when it's a top-level symbol, or a child of
                 * a currently-selected symbol.
                 */
                const active =
                  isSelectable ||
                  (!formulaDiagramsEnabled &&
                    isTopLevelSymbol &&
                    !isAncestorOfSelection &&
                    !isSelected) ||
                  (isLeaf && isSelected);

                const descendants = selectors.descendants(entity.id, entities);

                return (
                  <EntityAnnotation
                    key={annotationId}
                    id={annotationId}
                    className={classNames("symbol-annotation", {
                      "selection-hint": isSelectable,
                      "leaf-symbol": isLeaf,
                      "ancestor-of-selection": isAncestorOfSelection,
                    })}
                    pageView={pageView}
                    entity={entity}
                    /*
                     * Support selection of:
                     * 1. Top-level symbols (i.e., those that aren't children of others)
                     * 2. The children of a selected symbol, to allow selection refinement
                     * To allow the descendants of a selected symbol to be selectable, a selected
                     * symbol (once selected) should no longer be interactive itself.
                     */
                    active={active}
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
                    pageView={pageView}
                    entity={entity}
                    active={copySentenceOnClick}
                    underline={false}
                    selected={false}
                    selectedSpanIds={null}
                    onClick={this.onClickSentence}
                  />
                );
              } else if (isEquation(entity) && formulaDiagramsEnabled) {
                return (
                  <EntityAnnotation
                    key={annotationId}
                    className="equation-annotation"
                    id={annotationId}
                    pageView={pageView}
                    entity={entity}
                    underline={false}
                    selected={isSelected}
                    selectedSpanIds={selectedSpanIds}
                    handleSelect={this.props.handleSelectEntityAnnotation}
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
            pageView={pageView}
            pageNumber={pageNumber}
            entityType={entityCreationType}
            handleShowSnackbarMessage={this.props.handleShowSnackbarMessage}
            handleCreateEntity={handleCreateEntity}
          />
        ) : null}
        {formulaDiagramsEnabled &&
          entities !== null &&
          selectedEntities
            .filter(isEquation)
            .map((e) => (
              <EquationDiagram
                key={e.id}
                pageView={pageView}
                entities={entities}
                equation={e}
              />
            ))}
      </>,
      this._element
    );
  }

  private _element: HTMLElement;
}

export default PageOverlay;
