import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import Functions from "@material-ui/icons/Functions";
import MenuBook from "@material-ui/icons/MenuBook";
import Toc from "@material-ui/icons/Toc";
import classNames from "classnames";
import React from "react";
import { DrawerContentType } from "./Drawer";
import EntityLink from "./EntityLink";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { isSymbol, Symbol } from "./types/api";
import * as uiUtils from "./utils/ui";

const logger = getRemoteLogger();

interface Props {
  symbol: Symbol;
  entities: Entities;
  showDrawerActions?: boolean;
  handleOpenDrawer: (contentType: DrawerContentType) => void;
  handleJumpToEntity: (entityId: string) => void;
}

interface State {
  activeSymbolId: string;
  closed: boolean;
}

class SimpleSymbolGloss extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeSymbolId: props.symbol.id,
      closed: false,
    };
    this.setActiveSymbolId = this.setActiveSymbolId.bind(this);
    this.onClickDefinitionsButton = this.onClickDefinitionsButton.bind(this);
    this.onClickDefiningFormulasButton = this.onClickDefiningFormulasButton.bind(
      this
    );
    this.onClickUsagesButton = this.onClickUsagesButton.bind(this);
    this.onClickClose = this.onClickClose.bind(this);
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

  onClickDefinitionsButton() {
    this.props.handleOpenDrawer("definitions");
  }

  onClickDefiningFormulasButton() {
    this.props.handleOpenDrawer("defining-formulas");
  }

  onClickUsagesButton() {
    this.props.handleOpenDrawer("usages");
  }

  onClickClose() {
    this.setState({ closed: true });
  }

  render() {
    const { entities } = this.props;
    const { activeSymbolId } = this.state;
    const symbol = entities.byId[activeSymbolId] as Symbol;

    /*
     * Try to find definition and nickname right before the symbol.
     */
    let definition = selectors.adjacentDefinition(
      activeSymbolId,
      entities,
      "before"
    );
    let nicknameFrom = "before";
    let nickname = selectors.adjacentNickname(
      activeSymbolId,
      entities,
      "before"
    );

    /*
     * Only show nickname if it appeared after the last definition.
     */
    if (nickname !== null && definition !== null) {
      if (
        selectors.comparePosition(
          nickname.contextEntity,
          definition.contextEntity
        ) < 0
      ) {
        nickname = null;
      }
    }

    /*
     * If nothing was found before the symbol, search for the first
     * definition or nickname after it.
     */
    if (nickname === null && definition == null) {
      definition = selectors.adjacentDefinition(
        activeSymbolId,
        entities,
        "after"
      );
      if (definition === null) {
        nickname = selectors.adjacentNickname(
          activeSymbolId,
          entities,
          "after"
        );
        if (nickname !== null) {
          nicknameFrom = "after";
        }
      }
    }

    const originalSymbol = this.props.symbol;
    const defsAndNicknames = selectors.definitionsAndNicknames(
      [activeSymbolId],
      entities
    );
    const formulas = selectors.definingFormulas([activeSymbolId], entities);
    const usages = selectors.usages([activeSymbolId], entities);

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

    const definedHere = selectors.inDefinition(symbol.id, entities);

    /*
     * Find most recent definition.
     */
    return (
      <div
        className={classNames("gloss", "simple-gloss", "symbol-gloss", {
          "with-action-buttons": this.props.showDrawerActions,
          closed: this.state.closed,
        })}
      >
        <table>
          <tbody>
            <tr>
              {(definedHere || definition || nickname) && (
                <td>
                  {definedHere && <p>Defined here.</p>}
                  {!definedHere && (definition !== null || nickname !== null) && (
                    <p>
                      {definition !== null && (
                        <>
                          <RichText>{`${definition.excerpt}`}</RichText>
                          {" (page "}
                          <EntityLink
                            id={`symbol-${symbol.id}-definition`}
                            className="subtle"
                            entityId={definition.contextEntity.id}
                            handleJumpToEntity={this.props.handleJumpToEntity}
                          >
                            {selectors.readableFirstPageNumber(
                              definition.contextEntity
                            )}
                          </EntityLink>
                          {nickname !== null ? "); " : ")."}
                        </>
                      )}
                      {nickname !== null && (
                        <>
                          {`${nickname.excerpt}`}
                          {" (page "}
                          <EntityLink
                            id={`symbol-${symbol.id}-nickname`}
                            className="subtle"
                            entityId={nickname.contextEntity.id}
                            handleJumpToEntity={this.props.handleJumpToEntity}
                          >
                            {selectors.readableFirstPageNumber(
                              nickname.contextEntity
                            )}
                          </EntityLink>
                          {")."}
                        </>
                      )}
                    </p>
                  )}
                </td>
              )}
              {this.props.showDrawerActions && (
                <React.Fragment>
                  <td>
                    <MuiTooltip
                      title={
                        defsAndNicknames.length > 0
                          ? `See ${defsAndNicknames.length} definitions`
                          : "No definitions."
                      }
                    >
                      <IconButton
                        size="small"
                        disabled={defsAndNicknames.length === 0}
                        onClick={this.onClickDefinitionsButton}
                      >
                        <MenuBook />
                      </IconButton>
                    </MuiTooltip>
                  </td>
                  <td>
                    <MuiTooltip
                      title={
                        formulas.length > 0
                          ? `See ${formulas.length} defining formulas`
                          : "No defining formulas."
                      }
                    >
                      <IconButton
                        size="small"
                        disabled={formulas.length === 0}
                        onClick={this.onClickDefiningFormulasButton}
                      >
                        <Functions />
                      </IconButton>
                    </MuiTooltip>
                  </td>
                  <td>
                    <MuiTooltip
                      title={
                        usages.length > 0
                          ? `See ${usages.length} usages`
                          : "No usages."
                      }
                    >
                      <IconButton
                        size="small"
                        disabled={usages.length === 0}
                        onClick={this.onClickUsagesButton}
                      >
                        <Toc />
                      </IconButton>
                    </MuiTooltip>
                  </td>
                  <td>
                    <MuiTooltip title="Dismiss">
                      <IconButton size="small" onClick={this.onClickClose}>
                        <Close />
                      </IconButton>
                    </MuiTooltip>
                  </td>
                </React.Fragment>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
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
