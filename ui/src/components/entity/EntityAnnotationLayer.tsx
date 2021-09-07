import classNames from "classnames";
import React from "react";
import {
  Entity,
  isAnswerSentence,
  isCitation,
  isEquation,
  isExperience,
  isSectionHeader,
  isSentence,
  isSymbol,
  isTerm,
  Paper,
} from "../../api/types";
import * as selectors from "../../selectors";
import { GlossStyle } from "../../settings";
import { Entities, PaperId } from "../../state";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import { DrawerContentType } from "../drawer/Drawer";
import AnswerSentenceGloss from "./answers/AnswerSentenceGloss";
import LazyCitationGloss from "./citation/LazyCitationGloss";
import EntityAnnotation from "./EntityAnnotation";
import ExperienceGloss from "./experience/ExperienceGloss";
import SectionHeaderImage from "./headers/HeaderImage";
import SectionHeaderGloss from "./headers/SectionHeaderGloss";
import SimpleSymbolGloss from "./SimpleSymbolGloss";
import SimpleTermGloss from "./SimpleTermGloss";

export type SymbolUnderlineMethod = "top-level-symbols" | "defined-symbols";

interface Props {
  paperId?: PaperId;
  pageView: PDFPageView;
  entities: Entities;
  lazyPapers: Map<string, Paper>;
  selectedEntityIds: string[];
  selectedAnnotationIds: string[];
  selectedAnnotationSpanIds: string[];
  findMatchedEntityIds: string[] | null;
  findSelectionEntityId: string | null;
  jumpTarget: string | null;
  showAnnotations: boolean;
  annotationInteractionEnabled: boolean;
  showGlosses: boolean;
  glossStyle: GlossStyle;
  glossEvaluationEnabled: boolean;
  citationAnnotationsEnabled: boolean;
  termAnnotationsEnabled: boolean;
  symbolUnderlineMethod: SymbolUnderlineMethod;
  definitionsInSymbolGloss: boolean;
  equationDiagramsEnabled: boolean;
  copySentenceOnClick: boolean;
  handleSelectEntityAnnotation: (
    entityId: string,
    annotationId: string,
    spanId: string
  ) => void;
  handleShowSnackbarMessage: (message: string) => void;
  handleJumpToEntity: (entityId: string) => void;
  handleOpenDrawer: (contentType: DrawerContentType) => void;
  cachePaper: (paper: Paper) => void;
  selectedFAQID: string | null;
  FAQHoveredID: string | null;
}

class EntityAnnotationLayer extends React.Component<Props> {
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
    if (!equationDiagramsEnabled) {
      return false;
    }
    const equation = entities.byId[equationId];
    if (equation === undefined || !isEquation(equation)) {
      return false;
    }
    const isInlineEquation =
      equation.attributes.tex === null ||
      /^\s*\$\s*[^$]/.test(equation.attributes.tex);
    return (
      !isInlineEquation &&
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
      entities,
      lazyPapers,
      cachePaper,
      selectedEntityIds,
      selectedAnnotationIds,
      selectedAnnotationSpanIds,
      findMatchedEntityIds,
      findSelectionEntityId,
      jumpTarget,
      showAnnotations,
      annotationInteractionEnabled,
      showGlosses,
      glossStyle,
      glossEvaluationEnabled,
      citationAnnotationsEnabled,
      symbolUnderlineMethod,
      termAnnotationsEnabled,
      equationDiagramsEnabled,
      copySentenceOnClick,
      handleSelectEntityAnnotation,
    } = this.props;

    const pageNumber = uiUtils.getPageNumber(pageView);
    let selectedEntities: Entity[] = [];
    selectedEntities = selectedEntityIds.map((id) => entities.byId[id]);

    return (
      <>
        {entities.all.map((entityId) => {
          //added: for entities
          /*
           * Unpack entity data.
           */
          const entity = entities.byId[entityId];
          // const annotationId = `entity-${entityId}-page-${pageNumber}-annotation`;
          const annotationId = `entity-${entityId}-annotation`;
          const boundingBoxes = entity.attributes.bounding_boxes.filter(
            (box) => box.page === pageNumber
          );
          if (boundingBoxes.length === 0) {
            return null;
          }

          /*
           * Do not show abnormally large entities.
           */
          if (entity.attributes.tags.indexOf("large") !== -1) {
            return null;
          }

          /*
           * Determine generic selection properties. Select an annotation if it has been explicitly
           * selected, or if there are no selections and the annotation is for this entity.
           */
          let isSelected = false;
          if (selectedAnnotationIds.indexOf(annotationId) !== -1) {
            isSelected = true;
          } else if (
            selectedAnnotationIds.length === 0 &&
            selectedEntityIds.indexOf(entityId) !== -1
          ) {
            isSelected = true;
          }
          const isMatch =
            findMatchedEntityIds !== null &&
            findMatchedEntityIds.indexOf(entityId) !== -1;
          const isFindSelection = findSelectionEntityId === entityId;
          const selectedSpanIds = isSelected ? selectedAnnotationSpanIds : null;
          const isJumpTarget = jumpTarget === entityId;
          const inDefinition = selectors.inDefinition(entityId, entities);
          const hasDefinition = selectors.hasDefinition(entityId, entities);
          if (
            termAnnotationsEnabled &&
            isTerm(entity) &&
            entity.attributes.term_type !== "symbol" &&
            // entity.attributes.name !== null &&
            // entity.attributes.name.indexOf("SKIP") === -1 &&
            !(
              entity.attributes.term_type !== null &&
              entity.attributes.term_type.toLowerCase() === "ignore"
            )
          ) {
            return (
              <EntityAnnotation
                key={annotationId}
                id={annotationId}
                entity={entity}
                className="term-annotation"
                pageView={pageView}
                underline={showAnnotations && hasDefinition && !inDefinition}
                glossStyle={glossStyle}
                glossContent={
                  showGlosses ? (
                    <SimpleTermGloss
                      term={entity}
                      entities={entities}
                      showDrawerActions={true}
                      handleJumpToEntity={this.props.handleJumpToEntity}
                      handleOpenDrawer={this.props.handleOpenDrawer}
                    />
                  ) : null
                }
                selected={isSelected}
                selectedSpanIds={selectedSpanIds}
                active={annotationInteractionEnabled}
                isFindSelection={isFindSelection}
                isFindMatch={isMatch}
                handleSelect={handleSelectEntityAnnotation}
              />
            );
          } else if (
            citationAnnotationsEnabled &&
            isCitation(entity) &&
            entity.attributes.paper_id !== null
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
                  showGlosses ? (
                    <LazyCitationGloss
                      citation={entity}
                      lazyPapers={lazyPapers}
                      openedPaperId={paperId}
                      evaluationEnabled={glossEvaluationEnabled}
                      cachePaper={cachePaper}
                    />
                  ) : null
                }
                selected={isSelected}
                active={annotationInteractionEnabled}
                selectedSpanIds={selectedSpanIds}
                handleSelect={handleSelectEntityAnnotation}
              />
            );
            // added - experience
          } else if (
            citationAnnotationsEnabled &&
            isExperience(entity) &&
            entity.attributes.experience_id !== null
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
                  showGlosses ? <ExperienceGloss experience={entity} /> : null
                }
                selected={isSelected}
                active={annotationInteractionEnabled}
                selectedSpanIds={selectedSpanIds}
                handleSelect={handleSelectEntityAnnotation}
              />
            );
            // added - paperQuestion
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
                active={annotationInteractionEnabled && !isSelected}
                selectedSpanIds={selectedSpanIds}
                handleSelect={this.props.handleSelectEntityAnnotation}
              />
            );
          } else if (isSymbol(entity)) {
            /*
             * Only show annotations for identifiers and functions (i.e., not operators). In
             * the future, this filter could be exposed in the admin control panel.
             */
            const ANNOTATED_SYMBOL_TYPES = ["identifier", "function"];
            if (ANNOTATED_SYMBOL_TYPES.indexOf(entity.attributes.type) === -1) {
              return null;
            }

            /*
             * If the symbol appears in a selected equation, don't render it; the
             * equation diagram provides its own targets to click.
             */
            const equationId = entity.relationships.equation.id;
            const inSelectedEquation = selectedEntities.some(
              (e) => isEquation(e) && equationId === e.id
            );
            if (inSelectedEquation) {
              return null;
            }

            /*
             * A symbol should be shown as clickable in any of the conditions:
             * 1. It is the child of a selected symbol
             * 2. Equation annotations are disabled and it's a top-level symbol
             */
            const isSelectionChild = selectedEntities.some(
              (e) => isSymbol(e) && selectors.isChild(entity, e)
            );
            const isSelectionDescendant = selectedEntities.some(
              (e) => isSymbol(e) && selectors.isDescendant(entity, e, entities)
            );
            const isTopLevel = selectors.isTopLevelSymbol(entity, entities);

            const isTopLevelInSelectedEquation =
              isTopLevel && inSelectedEquation;
            const isSelectable =
              isSelectionChild ||
              isTopLevelInSelectedEquation ||
              (isTopLevel &&
                (equationId === null || !this.shouldShowEquation(equationId)));

            let underline = false;
            if (showAnnotations) {
              if (
                (equationId !== null && this.shouldShowEquation(equationId)) ||
                (equationDiagramsEnabled && inSelectedEquation)
              ) {
                underline = false;
              } else if (symbolUnderlineMethod === "top-level-symbols") {
                underline = isSelectable;
              } else if (symbolUnderlineMethod === "defined-symbols") {
                underline = selectors.shouldUnderline(entityId, entities);
              }
            }

            /*
             * Show a more prominent selection hint than an underline when the symbol is
             * child of something else that's already selected.
             */
            const showSelectionHint = isSelectionChild;

            const showTopLevelGlossHint =
              isTopLevel &&
              (hasDefinition ||
                selectors.descendantHasDefinition(entity.id, entities));

            /*
             * Compute attributes of symbols to use for styling, like whether it
             * is a search result, and how it relates to the current selections.
             */
            const isSelectionAncestor = selectedEntities.some(
              (e) => isSymbol(e) && selectors.isDescendant(e, entity, entities)
            );
            const isLeaf = entity.relationships.children.length === 0;

            /*
             * A symbol will be shown if it's either selectable, or if it's selected and
             * it doesn't have any children to be selected.
             */
            const active =
              annotationInteractionEnabled &&
              ((isSelectable && !isSelectionAncestor) ||
                (isLeaf && isSelected));

            return (
              <EntityAnnotation
                key={annotationId}
                id={annotationId}
                className={classNames("symbol-annotation", {
                  "selection-hint": showSelectionHint,
                  "top-level-gloss-hint": showTopLevelGlossHint,
                  "leaf-symbol": isLeaf,
                  "descendant-of-selection": isSelectionDescendant,
                  "ancestor-of-selection": isSelectionAncestor,
                  "in-selected-equation": inSelectedEquation,
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
                underline={underline}
                selected={isSelected}
                selectedSpanIds={selectedSpanIds}
                isFindSelection={isFindSelection}
                isFindMatch={isMatch}
                glossStyle={glossStyle}
                glossContent={
                  showGlosses &&
                  !(this.props.glossStyle === "tooltip" && !isFindSelection) ? (
                    <SimpleSymbolGloss
                      symbol={entity}
                      entities={entities}
                      showDrawerActions={true}
                      handleJumpToEntity={this.props.handleJumpToEntity}
                      handleOpenDrawer={this.props.handleOpenDrawer}
                      definitionsEnabled={this.props.definitionsInSymbolGloss}
                    />
                  ) : null
                }
                tooltipPlacement="below"
                handleSelect={this.props.handleSelectEntityAnnotation}
              />
            );
          } else if (isSentence(entity)) {
            return (
              <EntityAnnotation
                key={annotationId}
                className={classNames("sentence-annotation", {
                  "jump-target": isJumpTarget,
                })}
                id={annotationId}
                pageView={pageView}
                entity={entity}
                active={annotationInteractionEnabled}
                underline={true}
                selected={false}
                selectedSpanIds={null}
                onClick={this.onClickSentence}
                handleSelect={this.props.handleSelectEntityAnnotation}
              />
            );
          } else if (isAnswerSentence(entity)) {
            // figure out if this answer sentence should be highlighted
            const selectedFAQ = this.props.selectedFAQID;
            const hoveredFAQ = this.props.FAQHoveredID;
            const shouldHighlight =
              selectedFAQ || hoveredFAQ
                ? entity.relationships.question.id === selectedFAQ ||
                  entity.relationships.question.id === hoveredFAQ
                : false;
            const annotationClass = shouldHighlight
              ? "answer-sentence-annotation-selected"
              : "answer-sentence-annotation-selected";
            return (
              <EntityAnnotation
                key={annotationId}
                className={classNames(annotationClass, {
                  "jump-target": isJumpTarget,
                })}
                id={annotationId}
                pageView={pageView}
                entity={entity}
                active={annotationInteractionEnabled}
                underline={shouldHighlight}
                selected={isSelected}
                selectedSpanIds={selectedSpanIds}
                glossStyle={glossStyle}
                glossContent={
                  showGlosses ? (
                    <AnswerSentenceGloss
                      answer={entity}
                      entities={entities}
                      handleJumpToEntity={this.props.handleJumpToEntity}
                    />
                  ) : null
                }
                tooltipPlacement="lower-left"
                handleSelect={handleSelectEntityAnnotation}
              />
            );
          } else if (isSectionHeader(entity)) {
            return (
              <div className="section-header-annotation">
                <SectionHeaderImage entity={entity} pageView={pageView} />
                <EntityAnnotation
                  key={annotationId}
                  id={annotationId}
                  entity={entity}
                  className="section-header-annotation"
                  pageView={pageView}
                  underline={false}
                  glossStyle={glossStyle}
                  glossContent={
                    showGlosses ? <SectionHeaderGloss header={entity} /> : null
                  }
                  selected={isSelected}
                  tooltipPlacement="upper-right"
                  active={annotationInteractionEnabled}
                  selectedSpanIds={selectedSpanIds}
                  handleSelect={handleSelectEntityAnnotation}
                />
              </div>
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
