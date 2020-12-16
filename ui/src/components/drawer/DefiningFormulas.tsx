import classNames from "classnames";
import React from "react";
import EntityLink from "./EntityLink";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { Entity, isSymbol } from "./types/api";

const logger = getRemoteLogger();

interface Props {
  selectedEntityIds: string[];
  entities: Entities;
  handleJumpToEntity: (id: string) => void;
}

export class DefiningFormulas extends React.PureComponent<Props> {
  render() {
    const { selectedEntityIds, entities } = this.props;
    const selectedSymbolIds = selectedEntityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .map((s) => s.id);
    const formulas = selectors.definingFormulas(selectedSymbolIds, entities);

    return (
      <div className="document-snippets defining-formulas">
        <p className="drawer__content__header">Defining Formulas</p>
        {selectedEntityIds.length === 0 && (
          <p>To see formulas that define a symbol, first select a symbol.</p>
        )}
        {selectedEntityIds.length > 0 && (
          <p>
            {formulas.length === 0
              ? `No formulas were found that define the selected symbols.`
              : `Showing ${formulas.length} formula${
                  formulas.length === 1 ? "" : "s"
                } that define the selected symbols.`}
          </p>
        )}
        {formulas.map((f, i) => (
          <DefiningFormula
            key={f.contextEntity.id}
            id={`formula-${i}-${f.contextEntity.id}`}
            context={f.contextEntity}
            handleJumpToContext={this.props.handleJumpToEntity}
          >
            {f.excerpt}
          </DefiningFormula>
        ))}
      </div>
    );
  }
}

interface DefiningFormulaProps {
  id: string;
  context?: Entity;
  handleJumpToContext?: (contextEntityId: string) => void;
}

class DefiningFormula extends React.PureComponent<DefiningFormulaProps> {
  constructor(props: DefiningFormulaProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  /**
   * Scroll container to the first highlighted symbol in the formula, if there is one.
   */
  scrollToMatch(container: HTMLDivElement | null) {
    if (!container) {
      return;
    }
    const firstMatch = container.querySelector(".match-highlight");
    if (!firstMatch || !(firstMatch instanceof HTMLSpanElement)) {
      return;
    }
    const matchBox = firstMatch.getBoundingClientRect();
    const containerBox = container.getBoundingClientRect();
    const matchCenterX =
      matchBox.left - containerBox.left + firstMatch.clientWidth / 2;
    const matchCenterY =
      matchBox.top - containerBox.top + firstMatch.clientHeight / 2;
    container.scrollLeft = matchCenterX - container.clientWidth / 2;
    container.scrollTop = matchCenterY - container.clientHeight / 2;
  }

  onClick() {
    logger.log("debug", "clicked-jump-to-defining-formula", {
      contextEntity: this.props.context,
    });
    if (this.props.handleJumpToContext && this.props.context) {
      this.props.handleJumpToContext(this.props.context.id);
    }
  }

  render() {
    const { context: equation } = this.props;
    return (
      <>
        <div
          className={classNames("defining-formula", {
            clickable: this.props.context && this.props.handleJumpToContext,
          })}
          ref={this.scrollToMatch}
          onClick={this.onClick}
        >
          <RichText>{`$${this.props.children}$`}</RichText>
        </div>
        {this.props.handleJumpToContext && equation && (
          <p className="entity-link-message">
            {"See in context on page "}
            <EntityLink
              id={`${this.props.id}-text-link`}
              entityId={equation.id}
              handleJumpToEntity={this.props.handleJumpToContext}
            >
              {selectors.readableFirstPageNumber(equation)}
            </EntityLink>
            {"."}
          </p>
        )}
      </>
    );
  }

  private _container: HTMLDivElement | null = null;
}
