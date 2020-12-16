import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import Toc from "@material-ui/icons/Toc";
import classNames from "classnames";
import React from "react";
import { DrawerContentType } from "./Drawer";
import EntityPageLink from "./EntityPageLink";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { Term } from "./types/api";

const logger = getRemoteLogger();

interface Props {
  term: Term;
  entities: Entities;
  showDrawerActions?: boolean;
  handleOpenDrawer: (contentType: DrawerContentType) => void;
  handleJumpToEntity: (entityId: string) => void;
}

interface State {
  closed: boolean;
}

class SimpleTermGloss extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      closed: false,
    };
    this.onClickUsagesButton = this.onClickUsagesButton.bind(this);
    this.onClickClose = this.onClickClose.bind(this);
  }

  componentDidMount() {
    logger.log("debug", "rendered-term-tooltip", {
      term: selectors.termLogData(this.props.term),
    });
  }

  onClickUsagesButton() {
    logger.log("debug", "clicked-open-term-usages");
    this.props.handleOpenDrawer("usages");
  }

  onClickClose() {
    logger.log("debug", "clicked-dismiss-term-tooltip");
    this.setState({ closed: true });
  }

  render() {
    const { entities, term } = this.props;

    /*
     * Try to find definition and nickname right before the symbol.
     */
    let definition =
      selectors.adjacentDefinition(term.id, entities, "before") ||
      selectors.adjacentDefinition(term.id, entities, "after");

    const definedHere = selectors.inDefinition(term.id, entities);

    if (!definedHere && definition === null) {
      return null;
    }

    const usages = selectors.usages([term.id], entities);

    /*
     * Find most recent definition.
     */
    return (
      <div
        className={classNames("gloss", "term-gloss", "simple-gloss", {
          "with-action-buttons": this.props.showDrawerActions,
          closed: this.state.closed,
        })}
      >
        <table>
          <tbody>
            <tr>
              {(definedHere || definition) && (
                <td>
                  <div className="simple-gloss__definition-container">
                    {definedHere && <p>Defined here.</p>}
                    {!definedHere && definition !== null && (
                      <p>
                        {definition !== null && (
                          <>
                            <RichText>{`${definition.excerpt}`}</RichText>{" "}
                            <EntityPageLink
                              id={`term-${term.id}-definition-link`}
                              entity={definition.contextEntity}
                              handleJumpToEntity={this.props.handleJumpToEntity}
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

export default SimpleTermGloss;
