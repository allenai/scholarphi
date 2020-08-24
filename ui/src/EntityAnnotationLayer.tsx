import classNames from "classnames";
import React from "react";
import CitationGloss from "./CitationGloss";
import EntityAnnotation from "./EntityAnnotation";
import * as selectors from "./selectors";
import { GlossStyle } from "./settings";
import { Entities, PaperId, Papers, UserLibrary } from "./state";
import SymbolDefinitionGloss from "./SymbolDefinitionGloss";
import SymbolPropertyEvaluationGloss from "./SymbolPropertyEvaluationGloss";
import TermDefinitionGloss from "./TermDefinitionGloss";
import TermPropertyEvaluationGloss from "./TermPropertyEvaluationGloss";
import {
  Entity,
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
  entities: Entities;
  userLibrary: UserLibrary | null;
  selectedEntityIds: string[];
  selectedAnnotationIds: string[];
  selectedAnnotationSpanIds: string[];
  findMatchedEntityIds: string[] | null;
  findSelectionEntityId: string | null;
  showAnnotations: boolean;
  glossStyle: GlossStyle;
  glossEvaluationEnabled: boolean;
  equationDiagramsEnabled: boolean;
  copySentenceOnClick: boolean;
  handleSelectEntityAnnotation: (
    entityId: string,
    annotationId: string,
    spanId: string
  ) => void;
  handleShowSnackbarMessage: (message: string) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
}

class EntityAnnotationLayer extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.onClickSentence = this.onClickSentence.bind(this);
  }

  /**
   * Update this component using shallow comparison for most properties, and deep comparison
   * for lists of IDs (e.g., entity or annotation IDs). This is because it's expected that the
   * parent component of the PageOverlay will continuously recompute filtered lists of IDs
   * specific to this page as selections change on other pages. New filtered lists of IDs with
   * equivalent members should not trigger this page to update.
   */
  shouldComponentUpdate(nextProps: Props) {
    const ID_LIST_PROPS: (keyof Props)[] = [
      "selectedEntityIds",
      "selectedAnnotationIds",
      "selectedAnnotationSpanIds",
      "findMatchedEntityIds",
    ];
    return Object.keys(this.props).some((key) => {
      const name = key as keyof Props;
      if (ID_LIST_PROPS.indexOf(name) !== -1) {
        const list = (this.props[name] || []) as string;
        const nextList = (nextProps[name] || []) as string;
        for (let i = 0; i < Math.max(list.length, nextList.length); i++) {
          if (list[i] !== nextList[i]) {
            return true;
          }
        }
        return false;
      }
      return this.props[name] !== nextProps[name];
    });
  }

  /**
   * Only show an annotation for an equation if:
   * 1. equation diagrams are enabled
   * 2. the symbol has more than 1 top-level symbol
   * 3. a symbol isn't already selected in the equation
   */
  shouldShowEquation(equationId: string) {
    const { entities, equationDiagramsEnabled, selectedEntityIds } = this.props;
    return (
      equationDiagramsEnabled &&
      selectors.equationTopLevelSymbols(equationId, entities).length > 1 &&
      !selectedEntityIds
        .map((id) => entities.byId[id])
        .filter((e) => e !== undefined)
        .filter(isSymbol)
        .some((s) => s.relationships.equation.id === equationId)
    );
  }

  onClickSentence(
    event: React.MouseEvent<HTMLDivElement>,
    sentenceEntity: Entity
  ) {
    if (!isSentence(sentenceEntity)) {
      return;
    }
    if (event.altKey) {
      if (event.shiftKey) {
        const { id } = sentenceEntity;
        navigator.clipboard.writeText(id);
        this.props.handleShowSnackbarMessage(
          `Copied sentence ID to clipboard: ${id}.`
        );
        return true;
      } else {
        const { tex } = sentenceEntity.attributes;
        if (tex !== null) {
          navigator.clipboard.writeText(tex);
          const texPreview = uiUtils.truncateText(tex, 30, true);
          this.props.handleShowSnackbarMessage(
            `Copied LaTeX for sentence to clipboard: "${texPreview}"`
          );
        }
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
      showAnnotations,
      glossStyle,
      glossEvaluationEnabled,
      copySentenceOnClick,
      handleAddPaperToLibrary,
      handleSelectEntityAnnotation,
    } = this.props;

    const pageNumber = uiUtils.getPageNumber(pageView);
    let selectedEntities: Entity[] = [];
    selectedEntities = selectedEntityIds.map((id) => entities.byId[id]);

    return (
      <>
        {entities.all.map((entityId) => {
          const entity = entities.byId[entityId];
          const annotationId = `entity-${entityId}-page-${pageNumber}-annotation`;
          const isSelected = selectedAnnotationIds.indexOf(annotationId) !== -1;
          const boundingBoxes = entity.attributes.bounding_boxes.filter(
            (box) => box.page === pageNumber
          );
          if (boundingBoxes.length === 0) {
            return null;
          }
          const selectedSpanIds = isSelected ? selectedAnnotationSpanIds : null;
          if (
            isTerm(entity) &&
            entity.attributes.term_type !== "symbol" &&
            entity.attributes.name !== null &&
            entity.attributes.name.indexOf("SKIP") === -1
          ) {
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
          } else if (isEquation(entity) && this.shouldShowEquation(entity.id)) {
            return (
              <EntityAnnotation
                key={annotationId}
                className="equation-annotation"
                id={annotationId}
                pageView={pageView}
                entity={entity}
                underline={showAnnotations}
                selected={isSelected}
                selectedSpanIds={selectedSpanIds}
                handleSelect={this.props.handleSelectEntityAnnotation}
              />
            );
          } else if (isSymbol(entity)) {
            /*
             * A symbol should be shown as clickable in any of the conditions:
             * 1. It is the child of a selected symbol
             * 2. It is a top-level symbol in a selected equation
             * 3. Equation annotations are disabled and it's a top-level symbol
             */
            const isSelectionChild = selectedEntities.some(
              (e) => isSymbol(e) && selectors.isChild(entity, e)
            );
            const isTopLevel = selectors.isTopLevelSymbol(entity, entities);
            const equationId = entity.relationships.equation.id;
            const isTopLevelInSelectedEquation =
              isTopLevel &&
              selectedEntities.some(
                (e) => isEquation(e) && equationId === e.id
              );
            const isSelectable =
              isSelectionChild ||
              isTopLevelInSelectedEquation ||
              (isTopLevel &&
                (equationId === null || !this.shouldShowEquation(equationId)));

            /*
             * Show a more prominent selection hint than an underline when the symbol is
             * child of something else that's already selected.
             */
            const showSelectionHint =
              isSelectionChild || isTopLevelInSelectedEquation;

            /*
             * Compute attributes of symbols to use for styling, like whether it
             * is a search result, and how it relates to the current selections.
             */
            const isMatch =
              findMatchedEntityIds !== null &&
              findMatchedEntityIds.indexOf(entityId) !== -1;
            const isFindSelection = findSelectionEntityId === entityId;
            const isSelectionAncestor = selectedEntities.some(
              (e) => isSymbol(e) && selectors.isDescendant(e, entity, entities)
            );
            const isLeaf = entity.relationships.children.length === 0;
            const descendants = selectors.descendants(entity.id, entities);

            /*
             * A symbol will be shown if it's either selectable, or if it's selected and
             * it doesn't have any children to be selected.
             */
            const active = isSelectable || (isLeaf && isSelected);

            return (
              <EntityAnnotation
                key={annotationId}
                id={annotationId}
                className={classNames("symbol-annotation", {
                  "selection-hint": showSelectionHint,
                  "leaf-symbol": isLeaf,
                  "ancestor-of-selection": isSelectionAncestor,
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
                isFindSelection={isFindSelection}
                isFindMatch={isMatch}
                glossStyle={glossStyle}
                glossContent={
                  !(this.props.glossStyle === "tooltip" && !isFindSelection) ? (
                    glossEvaluationEnabled ? (
                      <SymbolPropertyEvaluationGloss
                        id={annotationId}
                        symbol={entity}
                        descendants={descendants}
                      />
                    ) : (
                      <SymbolDefinitionGloss symbol={entity} />
                    )
                  ) : null
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
                handleSelect={this.props.handleSelectEntityAnnotation}
              />
            );
          } else {
            return null;
          }
        })}
      </>
    );
  }
}

export default EntityAnnotationLayer;