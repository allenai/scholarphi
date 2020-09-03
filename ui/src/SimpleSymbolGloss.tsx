import classNames from "classnames";
import React from "react";
import EntityLink from "./EntityLink";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { isSentence, isSymbol, Relationship, Symbol } from "./types/api";
import * as uiUtils from "./utils/ui";

const logger = getRemoteLogger();

interface Props {
  symbol: Symbol;
  entities: Entities;
  handleJumpToEntity: (entityId: string) => void;
}

interface State {
  activeSymbolId: string;
}

class SimpleSymbolGloss extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeSymbolId: props.symbol.id,
    };
    this.setActiveSymbolId = this.setActiveSymbolId.bind(this);
  }

  setActiveSymbolId(id: string) {
    const { entities } = this.props;
    if (entities.byId[id] !== undefined && isSymbol(entities.byId[id])) {
      this.setState({ activeSymbolId: id });
    }
    logger.log("debug", "set-active-symbol", {
      ...this.getLogContext(),
      newActiveSymbol: this.props.entities.byId[id],
    });
  }

  getLogContext() {
    return {
      currentSymbol: this.props.entities.byId[this.state.activeSymbolId],
      originalSymbol: this.props.symbol,
    };
  }

  render() {
    const { entities } = this.props;
    const { activeSymbolId } = this.state;
    const symbol = entities.byId[activeSymbolId] as Symbol;

    const definition = selectors.definitionBefore(activeSymbolId, entities);
    const nickname = selectors.nicknameBefore(activeSymbolId, entities);

    const originalSymbol = this.props.symbol;

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
      .filter((s) => s.attributes.tex !== null)
      .filter(
        (s) =>
          s.attributes.nicknames.length > 0 ||
          s.attributes.definitions.length > 0 ||
          s.attributes.defining_formulas.length > 0
      );

    const relatedTexs = related.map((s) => s.attributes.tex) as string[];
    const relatedTexsByFrequency = uiUtils.sortByFrequency(relatedTexs);
    let alsoSee = [];
    for (const tex of relatedTexsByFrequency) {
      for (const r of related) {
        if (r.attributes.tex === tex) {
          alsoSee.push(r);
          break;
        }
      }
    }
    const MAX_ALSO_SEE = 5;
    alsoSee = alsoSee.slice(0, MAX_ALSO_SEE);

    if (nickname === null || definition === null) {
      return null;
    }

    const definedHere = symbol.relationships.definition_sentences.some(
      (r) => r.id !== null && r.id === symbol.relationships.sentence.id
    );

    /*
     * Find most recent definition.
     */
    return (
      <div
        className={classNames(
          "gloss",
          "symbol-definition-gloss",
          "contextual-symbol-gloss"
        )}
      >
        {definedHere && (
          <div className="gloss__section">
            <p>Defined here.</p>
          </div>
        )}
        {!definedHere && definition !== null && (
          <div className="gloss__section">
            <p>
              <EntityLink
                id={`symbol-${symbol.id}-definition`}
                entityId={definition.contextEntity.id}
                handleJumpToEntity={this.props.handleJumpToEntity}
              >
                <RichText>{definition.excerpt}</RichText>
              </EntityLink>
            </p>
          </div>
        )}
        {nickname !== null && (
          <div className="gloss__section">
            <p>
              Last called{' "'}
              <EntityLink
                id={`symbol-${symbol.id}-nickname`}
                entityId={nickname.contextEntity.id}
                handleJumpToEntity={this.props.handleJumpToEntity}
              >
                {nickname.excerpt}
              </EntityLink>
              {'"'}
            </p>
          </div>
        )}
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
    if (grouped[n] === undefined) {
      grouped[n] = [];
    }
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

export default SimpleSymbolGloss;
