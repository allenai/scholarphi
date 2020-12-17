import { DrawerContentType } from "../drawer/Drawer";
import { getRemoteLogger } from "../../logging";
import { EntityPageLink, RichText } from "../common";
import * as selectors from "../../selectors";
import { Entities } from "../../state";
import { Symbol } from "../../api/types";

import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import Functions from "@material-ui/icons/Functions";
import MenuBook from "@material-ui/icons/MenuBook";
import Toc from "@material-ui/icons/Toc";
import classNames from "classnames";
import React from "react";

const logger = getRemoteLogger();

interface Props {
  symbol: Symbol;
  entities: Entities;
  showDrawerActions?: boolean;
  handleOpenDrawer: (contentType: DrawerContentType) => void;
  handleJumpToEntity: (entityId: string) => void;
}

interface State {
  closed: boolean;
}

class SimpleSymbolGloss extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      closed: false,
    };
    this.onClickDefinitionsButton = this.onClickDefinitionsButton.bind(this);
    this.onClickDefiningFormulasButton = this.onClickDefiningFormulasButton.bind(
      this
    );
    this.onClickUsagesButton = this.onClickUsagesButton.bind(this);
    this.onClickClose = this.onClickClose.bind(this);
  }

  componentDidMount() {
    logger.log("debug", "rendered-symbol-tooltip", {
      symbol: selectors.symbolLogData(this.props.symbol),
    });
  }

  onClickDefinitionsButton() {
    logger.log("debug", "clicked-open-symbol-definitions");
    this.props.handleOpenDrawer("definitions");
  }

  onClickDefiningFormulasButton() {
    logger.log("debug", "clicked-open-symbol-defining-formulas");
    this.props.handleOpenDrawer("defining-formulas");
  }

  onClickUsagesButton() {
    logger.log("debug", "clicked-open-symbol-usages");
    this.props.handleOpenDrawer("usages");
  }

  onClickClose() {
    logger.log("debug", "clicked-dismiss-symbol-tooltip");
    this.setState({ closed: true });
  }

  render() {
    const { entities, symbol } = this.props;

    /*
     * Try to find definition and nickname right before the symbol.
     */
    let definition = selectors.adjacentDefinition(
      symbol.id,
      entities,
      "before"
    );
    let nickname = selectors.adjacentNickname(symbol.id, entities, "before");

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
      definition = selectors.adjacentDefinition(symbol.id, entities, "after");
      if (definition === null) {
        nickname = selectors.adjacentNickname(symbol.id, entities, "after");
      }
    }

    const defsAndNicknames = selectors.definitionsAndNicknames(
      [symbol.id],
      entities
    );
    const formulas = selectors.definingFormulas([symbol.id], entities);
    const usages = selectors.usages([symbol.id], entities);

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
                  <div className="simple-gloss__definition-container">
                    {definedHere && <p>Defined here.</p>}
                    {!definedHere &&
                      (definition !== null || nickname !== null) && (
                        <p>
                          {definition !== null && (
                            <>
                              <RichText>{`${definition.excerpt}`}</RichText>{" "}
                              <EntityPageLink
                                id={`symbol-${symbol.id}-definition-link`}
                                entity={definition.contextEntity}
                                handleJumpToEntity={
                                  this.props.handleJumpToEntity
                                }
                              />
                              {nickname !== null ? "; " : "."}
                            </>
                          )}
                          {nickname !== null && (
                            <>
                              <RichText>{`${nickname.excerpt}`}</RichText>{" "}
                              <EntityPageLink
                                id={`symbol-${symbol.id}-nickname-link`}
                                entity={nickname.contextEntity}
                                handleJumpToEntity={
                                  this.props.handleJumpToEntity
                                }
                              />
                              {"."}
                            </>
                          )}
                        </p>
                      )}
                  </div>
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

export default SimpleSymbolGloss;
