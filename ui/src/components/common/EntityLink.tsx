import { getRemoteLogger } from "../../logging";

import classNames from "classnames";
import React from "react";

const logger = getRemoteLogger();

interface Props {
  id?: string;
  className?: string;
  entityId?: string | null;
  handleJumpToEntity: (entityId: string) => void;
}

export class EntityLink extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(e: React.MouseEvent<HTMLSpanElement>) {
    logger.log("debug", "clicked-jump-to-context", {
      id: this.props.id,
      entityId: this.props.entityId,
      linkText:
        typeof this.props.children === "string"
          ? this.props.children
          : undefined,
    });
    if (this.props.entityId) {
      this.props.handleJumpToEntity(this.props.entityId);
    }
    e.stopPropagation();
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
