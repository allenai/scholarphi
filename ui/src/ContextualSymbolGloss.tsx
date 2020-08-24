import classNames from "classnames";
import React from "react";
import RichText from "./RichText";
import { Entities } from "./state";
import { isSentence, Relationship, Symbol } from "./types/api";
import * as uiUtils from "./utils/ui";

interface Props {
  symbol: Symbol;
  entities: Entities;
  handleJumpToEntity: (entityId: string) => void;
}

type DetailLevel = "default" | "nicknames" | "definition" | "everything";

interface State {
  detail: DetailLevel;
}

class ContextualSymbolGloss extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      detail: "everything",
    };
  }

  render() {
    const { symbol, entities } = this.props;
    const { detail } = this.state;
    const {
      tex,
      nicknames,
      definitions,
      defining_formulas,
      // is_definition,
      // snippets,
    } = symbol.attributes;
    const {
      parent,
      children,
      nickname_sentences,
      definition_sentences,
      defining_formula_equations,
      // snippet_sentences,
    } = symbol.relationships;

    const groupedNicknames = groupNicknames(
      nicknames,
      nickname_sentences,
      entities
    );
    const nicknamesOrdered = uiUtils.sortByFrequency(nicknames);

    return (
      <div className="gloss symbol-definition-gloss">
        {(detail === "nicknames" || detail === "everything") &&
        nicknames.length > 0 ? (
          <div className="gloss__section">
            <p>
              In this paper, called{" "}
              {nicknamesOrdered.map((n) => (
                <span className="symbol-nickname" key={n}>
                  "{n}"{" "}
                  <span className="sentence-reference">
                    (see page{" "}
                    {groupedNicknames[n].map((use, i) => (
                      <React.Fragment key={use.sentenceId}>
                        <EntityLinkSpan
                          entityId={use.sentenceId}
                          handleJumpToEntity={this.props.handleJumpToEntity}
                        >
                          {use.page}
                        </EntityLinkSpan>
                        {i < groupedNicknames[n].length - 1 ? " " : null}
                      </React.Fragment>
                    ))}
                    )
                  </span>
                </span>
              ))}
            </p>
          </div>
        ) : null}
        {detail === "everything" ? (
          <div className="gloss__section">
            {defining_formulas.map((f, i) => {
              let equationId;
              const equation = defining_formula_equations[i];
              if (equation) {
                equationId = equation.id || undefined;
              }
              return (
                <DefiningFormula
                  key={i}
                  equationId={equationId}
                  handleJumpToEquation={this.props.handleJumpToEntity}
                >
                  {f}
                </DefiningFormula>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }
}

function groupNicknames(
  nicknames: string[],
  nickname_sentences: Relationship[],
  entities: Entities
) {
  const grouped: {
    [nickname: string]: { page: number; sentenceId: string }[];
  } = {};
  nicknames.forEach((n, i) => {
    if (!nickname_sentences[i]) {
      return;
    }
    const sentenceId = nickname_sentences[i].id;
    if (!sentenceId) {
      return;
    }
    const sentence = entities.byId[sentenceId];
    if (!sentence || !isSentence(sentence)) {
      return;
    }
    if (grouped[n] === undefined) {
      grouped[n] = [];
    }
    const sentenceBoxes = sentence.attributes.bounding_boxes;
    if (sentenceBoxes.length > 0) {
      const firstPage = Math.min(...sentenceBoxes.map((b) => b.page));
      grouped[n].push({ page: firstPage, sentenceId: sentence.id });
    }
  });
  for (const nickname in grouped) {
    grouped[nickname].sort(({ page: p1 }, { page: p2 }) => {
      return p1 - p2;
    });
  }
  return grouped;
}

interface EntityLinkSpanProps {
  className?: string;
  entityId?: string | null;
  handleJumpToEntity: (entityId: string) => void;
}

class EntityLinkSpan extends React.PureComponent<EntityLinkSpanProps> {
  constructor(props: EntityLinkSpanProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(event: React.MouseEvent<HTMLSpanElement>) {
    if (this.props.entityId) {
      this.props.handleJumpToEntity(this.props.entityId);
    }
  }

  render() {
    return (
      <span
        className={classNames("entity-link-span", this.props.className, {
          clickable: this.props.entityId,
        })}
        onClick={this.onClick}
      >
        {this.props.children}
      </span>
    );
  }
}

interface DefiningFormulaProps {
  equationId?: string;
  handleJumpToEquation?: (equationId: string) => void;
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
    if (this.props.handleJumpToEquation && this.props.equationId) {
      this.props.handleJumpToEquation(this.props.equationId);
    }
  }

  render() {
    return (
      <div
        className={classNames("defining-formula", {
          clickable:
            this.props.equationId !== null && this.props.handleJumpToEquation,
        })}
        ref={this.scrollToMatch}
        onClick={this.onClick}
      >
        <RichText>{`\$${this.props.children}\$`}</RichText>
      </div>
    );
  }

  private _container: HTMLDivElement | null = null;
}

export default ContextualSymbolGloss;
