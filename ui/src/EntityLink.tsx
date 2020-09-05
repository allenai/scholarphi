import classNames from "classnames";
import React from "react";
import { getRemoteLogger } from "./logging";

const logger = getRemoteLogger();

interface Props {
  id?: string;
  className?: string;
  entityId?: string | null;
  handleJumpToEntity: (entityId: string) => void;
}

class EntityLink extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(event: React.MouseEvent<HTMLSpanElement>) {
    logger.log("debug", "clicked-to-jump-to-context", {
      id: this.props.id,
      entityId: this.props.entityId,
    });
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

export default EntityLink;
