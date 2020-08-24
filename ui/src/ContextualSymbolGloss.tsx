import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classNames from "classnames";
import React from "react";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entities } from "./state";
import {
  Entity,
  Equation,
  isEquation,
  isSentence,
  isSymbol,
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
  activeSymbolId: string;
  formulasOpen: boolean;
  usagesOpen: boolean;
}

/**
 * Rendering of equations takes place using KaTeX. This leaves the rest of the text formatting
 * for the prose, like citations, references, citations, italics, bolds, and more. Perform
 * some simple (brittle) replacements to clean up the text.
 */
function cleanTex(contents: string) {
  const noArgMacro = (name: string) => new RegExp(`\\\\${name}(?:\{\})?`, "g");
  const oneArgMacro = (name: string) =>
    new RegExp(`\\\\${name}\\{([^}]*)\\}`, "g");
  return contents
    .replace(/%.*?$/gm, "")
    .replace(oneArgMacro("label"), "")
    .replace(oneArgMacro("texttt"), "$1")
    .replace(oneArgMacro("textbf"), "$1")
    .replace(oneArgMacro("textit|emph"), "$1")
    .replace(oneArgMacro("footnote"), "")
    .replace(oneArgMacro("\\w*cite\\w*\\*?"), "[Citation]")
    .replace(oneArgMacro("(?:eq|c|)ref"), "[Reference]")
    .replace(oneArgMacro("gls(?:pl)?\\*"), (_, arg) => arg.toUpperCase())
    .replace(noArgMacro("bfseries"), "");
}

class ContextualSymbolGloss extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      detail: "everything",
      activeSymbolId: props.symbol.id,
      formulasOpen: false,
      usagesOpen: false,
    };
    this.onChangeFormulasOpen = this.onChangeFormulasOpen.bind(this);
    this.onChangeUsagesOpen = this.onChangeUsagesOpen.bind(this);
    this.setActiveSymbolId = this.setActiveSymbolId.bind(this);
  }

  setActiveSymbolId(id: string) {
    const { entities } = this.props;
    if (entities.byId[id] !== undefined && isSymbol(entities.byId[id])) {
      this.setState({ activeSymbolId: id });
    }
  }

  onChangeFormulasOpen(_, expanded: boolean) {
    this.setState({ formulasOpen: expanded });
  }

  onChangeUsagesOpen(_, expanded: boolean) {
    this.setState({ usagesOpen: expanded });
  }

  render() {
    const { entities } = this.props;
    const { activeSymbolId, detail } = this.state;
    const symbol = entities.byId[activeSymbolId] as Symbol;

    const { snippets, sentences: snippetSentences } = getSnippets(
      symbol,
      entities
    );
    const { formulas, equations: formulaEquations } = getDefiningFormulas(
      symbol,
      entities
    );

    const {
      tex,
      nicknames,
      definitions,
      // is_definition,
    } = symbol.attributes;
    const {
      parent,
      children,
      nickname_sentences,
      definition_sentences,
    } = symbol.relationships;

    const related = entities.all
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .filter(
        (s) =>
          s.attributes.tex !== null &&
          s.attributes.tex === symbol.attributes.tex
      )
      .map((s) => s.relationships.children.concat(s.relationships.parent))
      .flat()
      .filter((r) => r.id !== null)
      .map((r) => entities.byId[r.id as string])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .filter((s) => s.attributes.tex !== null);

    const alsoSee: Symbol[] = [];
    const alsoSeeTexs: { [tex: string]: boolean } = {};
    related.forEach((r) => {
      if (!alsoSeeTexs[r.attributes.tex as string]) {
        alsoSee.push(r);
        alsoSeeTexs[r.attributes.tex as string] = true;
      }
    });

    const originalSymbol = this.props.symbol;

    const groupedNicknames = groupNicknames(
      nicknames,
      nickname_sentences,
      entities
    );
    const nicknamesOrdered = uiUtils.sortByFrequency(nicknames);

    return (
      <div
        className={classNames("gloss", "symbol-definition-gloss", {
          "mode-everything": detail === "everything",
        })}
      >
        {(detail === "definition" || detail === "everything") &&
          alsoSee.length > 0 && (
            <div className="gloss__section">
              <p>
                Also see{" "}
                {alsoSee.map((s, i) => (
                  <>
                    <SymbolLink
                      symbol={s}
                      handleSetActiveSymbol={this.setActiveSymbolId}
                    />
                    {i < alsoSee.length - 1 && ", "}
                  </>
                ))}
              </p>
            </div>
          )}
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
        {detail === "everything" && formulas.length > 0 ? (
          <div className="gloss__section">
            <Accordion
              expanded={this.state.formulasOpen}
              onChange={this.onChangeFormulasOpen}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Defining Formulas
              </AccordionSummary>
              <AccordionDetails>
                <div>
                  <p className="gloss-section__label">
                    Showing defining formulas. Formulas before this page are
                    shown first.
                  </p>
                  <GlossSection>
                    {formulas.map((f, i) => (
                      <DefiningFormula
                        key={i}
                        equation={formulaEquations[i]}
                        linkText={getLinkText(
                          originalSymbol,
                          formulaEquations[i]
                        )}
                        handleJumpToEquation={this.props.handleJumpToEntity}
                      >
                        {f}
                      </DefiningFormula>
                    ))}
                  </GlossSection>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ) : null}
        {detail === "everything" && snippets.length > 0 ? (
          <div className="gloss__section">
            <Accordion
              expanded={this.state.usagesOpen}
              onChange={this.onChangeUsagesOpen}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Sample Usages
              </AccordionSummary>
              <AccordionDetails>
                <div>
                  <p className="gloss-section__label">
                    Showing usages of this symbol. Usages after this page are
                    shown first.
                  </p>
                  <GlossSection>
                    {snippets.map((s, i) => (
                      <Snippet
                        key={i}
                        sentence={snippetSentences[i]}
                        linkText={getLinkText(
                          originalSymbol,
                          snippetSentences[i]
                        )}
                        handleJumpToSnippet={this.props.handleJumpToEntity}
                      >
                        {s}
                      </Snippet>
                    ))}
                  </GlossSection>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ) : null}
      </div>
    );
  }
}

function getLinkText(source: Entity, destination: Entity) {
  const sourcePage = getFirstPage(source);
  const destPage = getFirstPage(destination);
  if (sourcePage === null || destPage === null) {
    return null;
  }
  if (sourcePage === destPage) {
    return `See in context on this page`;
  } else {
    return `See in context on page ${destPage + 1}`;
  }
}

function getDefiningFormulas(symbol: Symbol, entities: Entities) {
  const currentPage = getFirstPage(symbol);
  if (currentPage === null) {
    return { formulas: [], equations: [] };
  }

  const { defining_formulas } = symbol.attributes;
  const { defining_formula_equations } = symbol.relationships;

  const before = [];
  const onPage = [];
  const after = [];

  for (let i = 0; i < defining_formulas.length; i++) {
    const formula = defining_formulas[i];
    const equationRelationship = defining_formula_equations[i];
    if (
      equationRelationship === undefined ||
      equationRelationship.id === null
    ) {
      continue;
    }
    const equation = entities.byId[equationRelationship.id];
    if (equation === undefined || !isEquation(equation)) {
      continue;
    }
    const equationPage = getFirstPage(equation);
    if (equationPage === null) {
      continue;
    }
    if (equationPage === currentPage) {
      onPage.push({ formula, equation });
    }
    if (equationPage < currentPage) {
      before.push({ formula, equation });
    }
    if (equationPage > currentPage) {
      after.push({ formula, equation });
    }
  }

  before.sort((f1, f2) => {
    return comparePosition(f1.equation, f2.equation);
  });
  onPage.sort((f1, f2) => {
    return comparePosition(f1.equation, f2.equation);
  });
  after.sort((f1, f2) => {
    return comparePosition(f1.equation, f2.equation);
  });

  return {
    formulas: [
      before.map((f) => f.formula),
      after.map((f) => f.formula),
      onPage.map((f) => f.formula),
    ].flat(),
    equations: [
      before.map((f) => f.equation),
      after.map((f) => f.equation),
      onPage.map((f) => f.equation),
    ].flat(),
  };
}

function comparePosition(e1: Entity, e2: Entity) {
  if (
    e1.attributes.bounding_boxes.length === 0 ||
    e2.attributes.bounding_boxes.length === 0
  ) {
    return 0;
  }
  return selectors.compareBoxes(
    e1.attributes.bounding_boxes[0],
    e2.attributes.bounding_boxes[0]
  );
}

function getSnippets(symbol: Symbol, entities: Entities) {
  const currentPage = getFirstPage(symbol);
  if (currentPage === null) {
    return { snippets: [], sentences: [] };
  }

  const { snippets } = symbol.attributes;
  const { snippet_sentences } = symbol.relationships;

  const before = [];
  const onPage = [];
  const after = [];

  for (let i = 0; i < snippets.length; i++) {
    const snippet = snippets[i];
    const MAXIMUM_SNIPPET_LENGTH = 200;
    if (snippet.length > MAXIMUM_SNIPPET_LENGTH) {
      continue;
    }
    const sentenceRelationship = snippet_sentences[i];
    if (
      sentenceRelationship === undefined ||
      sentenceRelationship.id === null
    ) {
      continue;
    }
    const sentence = entities.byId[sentenceRelationship.id];
    if (sentence === undefined || !isSentence(sentence)) {
      continue;
    }
    const sentencePage = getFirstPage(sentence);
    if (sentencePage === null) {
      continue;
    }
    if (sentencePage === currentPage) {
      onPage.push({ snippet, sentence });
    }
    if (sentencePage < currentPage) {
      before.push({ snippet, sentence });
    }
    if (sentencePage > currentPage) {
      after.push({ snippet, sentence });
    }
  }

  before.sort((s1, s2) => {
    return comparePosition(s1.sentence, s2.sentence);
  });
  onPage.sort((s1, s2) => {
    return comparePosition(s1.sentence, s2.sentence);
  });
  after.sort((s1, s2) => {
    return comparePosition(s1.sentence, s2.sentence);
  });

  return {
    snippets: [
      after.map((s) => s.snippet),
      before.map((s) => s.snippet),
      onPage.map((s) => s.snippet),
    ].flat(),
    sentences: [
      after.map((s) => s.sentence),
      before.map((s) => s.sentence),
      onPage.map((s) => s.sentence),
    ].flat(),
  };
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

interface SymbolLinkProps {
  symbol: Symbol;
  handleSetActiveSymbol: (symbolId: string) => void;
}

class SymbolLink extends React.PureComponent<SymbolLinkProps> {
  constructor(props: SymbolLinkProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.handleSetActiveSymbol(this.props.symbol.id);
  }

  render() {
    if (this.props.symbol.attributes.tex === null) {
      return null;
    }
    return (
      <span className="other-symbol-link" onClick={this.onClick}>
        <RichText>{this.props.symbol.attributes.tex as string}</RichText>
      </span>
    );
  }
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
  linkText?: string | null;
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
    const { equation } = this.props;
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
        {this.props.handleJumpToEquation && equation && this.props.linkText && (
          <p>
            <EntityLinkSpan
              entityId={equation.id}
              handleJumpToEntity={this.props.handleJumpToEquation}
            >
              {this.props.linkText}
            </EntityLinkSpan>
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
  linkText?: string | null;
  handleJumpToSnippet?: (sentenceId: string) => void;
  children: string;
}

class Snippet extends React.PureComponent<SnippetProps> {
  render() {
    const { sentence } = this.props;
    return (
      <>
        <div className="snippet">
          <RichText>{cleanTex(this.props.children)}</RichText>
        </div>
        {this.props.handleJumpToSnippet && this.props.linkText ? (
          <p>
            {" "}
            <EntityLinkSpan
              entityId={sentence ? sentence.id : undefined}
              handleJumpToEntity={this.props.handleJumpToSnippet}
            >
              {this.props.linkText}
            </EntityLinkSpan>
            {"."}
          </p>
        ) : null}
      </>
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
