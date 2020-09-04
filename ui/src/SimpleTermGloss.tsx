import IconButton from "@material-ui/core/IconButton";
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

class SimpleTermGloss extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClickUsagesButton = this.onClickUsagesButton.bind(this);
  }

  onClickUsagesButton() {
    this.props.handleOpenDrawer("usages");
  }

  render() {
    const { entities, term } = this.props;

    /*
     * Try to find definition and nickname right before the symbol.
     */
    let definition = selectors.adjacentDefinition(term.id, entities, "before");

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
          { "with-action-buttons": this.props.showDrawerActions }
        )}
      >
        <div className="gloss__section">
          <p>
            <RichText>{definition.excerpt}</RichText>
            {"(page "}
            <EntityLink
              id={`term-${term.id}-definition`}
              className="subtle"
              entityId={definition.contextEntity.id}
              handleJumpToEntity={this.props.handleJumpToEntity}
            ></EntityLink>
            {")."}
          </p>
        </div>
        {this.props.showDrawerActions && (
          <div className="inline-gloss__action-buttons">
            <IconButton
              size="small"
              disabled={usages.length === 0}
              onClick={this.onClickUsagesButton}
            >
              <Toc />
            </IconButton>
          </div>
        )}
      </div>
    );
  }
}

export default SimpleTermGloss;
