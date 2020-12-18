import { EntityLink } from "./EntityLink";
import * as selectors from "../../selectors";
import { Entity } from "../../api/types";

import React from "react";

interface Props {
  id?: string;
  entity: Entity;
  handleJumpToEntity: (entityId: string) => void;
}

export class EntityPageLink extends React.PureComponent<Props> {
  render() {
    return (
      <span id={this.props.id} className="entity-page-link">
        {"(page "}
        <EntityLink
          id={this.props.id ? `${this.props.id}-clickable-link` : undefined}
          className="subtle"
          entityId={this.props.entity.id}
          handleJumpToEntity={this.props.handleJumpToEntity}
        >
          {selectors.readableFirstPageNumber(this.props.entity)}
        </EntityLink>
        {")"}
      </span>
    );
  }
}
