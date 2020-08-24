import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import classNames from "classnames";
import React from "react";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import { Entities } from "./state";
import {
  Entity,
  Equation,
  isEquation,
  isSentence,
  Relationship,
  Sentence,
  Symbol,
} from "./types/api";
import * as uiUtils from "./utils/ui";
import VoteButton from "./VoteButton";

const logger = getRemoteLogger();

interface Props {
  symbol: Symbol;
  entities: Entities;
  handleJumpToEntity: (entityId: string) => void;
}

type DetailLevel = "default" | "nicknames" | "definition" | "everything";

interface State {
  detail: DetailLevel;
}

/**
 * Rendering of equations takes place using KaTeX. This leaves the rest of the text formatting
 * for the prose, like citations, references, citations, italics, bolds, and more. Perform
 * some simple (brittle) replacements to clean up the text.
 */
function cleanTex(contents: string) {
  const simpleMacro = (name: string) =>
    new RegExp(`\\\\${name}\\{([^}]*)\\}`, "g");
  return contents
    .replace(/%.*?$/gm, "")
    .replace(simpleMacro("label"), "")
    .replace(simpleMacro("texttt"), "$1")
    .replace(simpleMacro("textit|emph"), "$1")
    .replace(simpleMacro("footnote"), "")
    .replace(simpleMacro("\\w*cite\\*?"), "[Citation]")
    .replace(simpleMacro("(?:eq|c|)ref"), "[Reference]")
    .replace(simpleMacro("gls(?:pl)?\\*"), (_, arg) => arg.toUpperCase());
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
      snippets,
    } = symbol.attributes;
    const {
      parent,
      children,
      nickname_sentences,
      definition_sentences,
      defining_formula_equations,
      snippet_sentences,
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
        {detail === "everything" && defining_formulas.length > 0 ? (
          <div className="gloss__section">
            <GlossSection>
              {defining_formulas.map((f, i) => {
                let equation = undefined;
                const equationRelationship = defining_formula_equations[i];
                if (equationRelationship && equationRelationship.id !== null) {
                  const entity = entities.byId[equationRelationship.id];
                  if (isEquation(entity)) {
                    equation = entity;
                  }
                }
                return (
                  <DefiningFormula
                    key={i}
                    equation={equation}
                    handleJumpToEquation={this.props.handleJumpToEntity}
                  >
                    {f}
                  </DefiningFormula>
                );
              })}
            </GlossSection>
          </div>
        ) : null}
        {detail === "everything" && snippets.length > 0 ? (
          <div className="gloss__section">
            <GlossSection>
              {snippets.map((s, i) => {
                let sentence = undefined;
                const sentenceRelationship = snippet_sentences[i];
                if (sentenceRelationship && sentenceRelationship.id !== null) {
                  const entity = entities.byId[sentenceRelationship.id];
                  if (isSentence(entity)) {
                    sentence = entity;
                  }
                }
                return (
                  <Snippet
                    key={i}
                    sentence={sentence}
                    handleJumpToSnippet={this.props.handleJumpToEntity}
                  >
                    {s}
                  </Snippet>
                );
              })}
            </GlossSection>
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
  equation?: Equation;
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
    if (this.props.handleJumpToEquation && this.props.equation) {
      this.props.handleJumpToEquation(this.props.equation.id);
    }
  }

  render() {
    let equationPage = null;
    const { equation } = this.props;
    if (equation) {
      equationPage = getFirstPage(equation);
    }
    return (
      <>
        <div
          className={classNames("defining-formula", {
            clickable: this.props.equation && this.props.handleJumpToEquation,
          })}
          ref={this.scrollToMatch}
          onClick={this.onClick}
        >
          <RichText>{`\$${this.props.children}\$`}</RichText>
        </div>
        {this.props.handleJumpToEquation && equation && equationPage && (
          <p>
            <EntityLinkSpan
              entityId={equation.id}
              handleJumpToEntity={this.props.handleJumpToEquation}
            >{`See in context on page ${equationPage}`}</EntityLinkSpan>
            .
          </p>
        )}
      </>
    );
  }

  private _container: HTMLDivElement | null = null;
}

interface SnippetProps {
  sentence?: Sentence;
  handleJumpToSnippet?: (sentenceId: string) => void;
  children: string;
}

class Snippet extends React.PureComponent<SnippetProps> {
  render() {
    let sentencePage = null;
    const { sentence } = this.props;
    if (sentence) {
      sentencePage = getFirstPage(sentence);
    }
    return (
      <div className="snippet">
        <RichText>{cleanTex(this.props.children)}</RichText>
        {this.props.handleJumpToSnippet && sentencePage ? (
          <>
            {" "}
            <EntityLinkSpan
              entityId={sentence ? sentence.id : undefined}
              handleJumpToEntity={this.props.handleJumpToSnippet}
            >
              {`See in context on page ${sentencePage}`}
            </EntityLinkSpan>
            {"."}
          </>
        ) : null}
      </div>
    );
  }
}

function getFirstPage(entity: Entity) {
  const boxes = entity.attributes.bounding_boxes;
  if (boxes.length === 0) {
    return null;
  }
  return Math.min(...boxes.map((b) => b.page));
}

interface GlossSectionState {
  visibleRows: number;
}

class GlossSection extends React.PureComponent<{}, GlossSectionState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      visibleRows: 2,
    };
    this.onClickShowMore = this.onClickShowMore.bind(this);
  }

  onClickShowMore() {
    logger.log("debug", "Clicked on show more", {
      currentVisibleRows: this.state.visibleRows,
    });
    this.setState((prevState) => ({
      visibleRows: prevState.visibleRows + 2,
    }));
  }

  render() {
    const { children } = this.props;
    if (children === null || !(children instanceof Array)) {
      return;
    }

    return (
      <Table className="gloss-entry-table" size="small">
        <TableBody>
          {children
            .filter((c, i) => i < this.state.visibleRows)
            .map((c, i) => (
              <TableRow>
                <TableCell className="gloss-entry__property">{c}</TableCell>
                <TableCell className="gloss-entry__vote-button">
                  <VoteButton context={{}} />
                </TableCell>
              </TableRow>
            ))}
          {this.state.visibleRows < children.length ? (
            <TableRow className="gloss-entry-table__action-buttons-row">
              <TableCell colSpan={2}>
                <Button
                  className="gloss-entry-table__action-button"
                  color="primary"
                  variant="outlined"
                  onClick={this.onClickShowMore}
                >
                  Show more
                </Button>
              </TableCell>
              <TableCell />
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    );
  }
}

export default ContextualSymbolGloss;
