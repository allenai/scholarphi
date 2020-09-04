import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import Toc from "@material-ui/icons/Toc";
import classNames from "classnames";
import React from "react";
import { DrawerContentType } from "./Drawer";
import EntityLink from "./EntityLink";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { Term } from "./types/api";

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

  onClickUsagesButton() {
    this.props.handleOpenDrawer("usages");
  }

  onClickClose() {
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
    if (definedHere) {
      return null;
    }

    if (definition === null) {
      return null;
    }

    const usages = selectors.usages([term.id], entities);

    /*
     * Find most recent definition.
     */
    return (
      <div
        className={classNames(
          "gloss",
          "inline-gloss",
          "term-gloss",
          "simple-gloss",
          {
            "with-action-buttons": this.props.showDrawerActions,
            closed: this.state.closed,
          }
        )}
      >
        <div className="gloss__section">
          <p>
            <RichText>{definition.excerpt}</RichText>
            {" (page "}
            <EntityLink
              id={`term-${term.id}-definition`}
              className="subtle"
              entityId={definition.contextEntity.id}
              handleJumpToEntity={this.props.handleJumpToEntity}
            >
              {selectors.readableFirstPageNumber(definition.contextEntity)}
            </EntityLink>
            {")."}
          </p>
        </div>
        {this.props.showDrawerActions && (
          <div className="inline-gloss__action-buttons">
            <MuiTooltip
              title={
                usages.length > 0 ? `See ${usages.length} usages` : "No usages."
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
            <MuiTooltip title="Dismiss">
              <IconButton size="small" onClick={this.onClickClose}>
                <Close />
              </IconButton>
            </MuiTooltip>
          </div>
        )}
      </div>
    );
  }
}

export default SimpleTermGloss;
