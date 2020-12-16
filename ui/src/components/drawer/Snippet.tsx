import classNames from "classnames";
import React from "react";
import EntityLink from "./EntityLink";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entity } from "./types/api";

const logger = getRemoteLogger();

interface Props {
  id: string;
  context?: Entity;
  handleJumpToContext?: (contextEntityId: string) => void;
  children: string;
}

class Snippet extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    logger.log("debug", "clicked-jump-to-snippet-context", {
      contextEntity: this.props.context,
    });
    if (this.props.handleJumpToContext && this.props.context) {
      this.props.handleJumpToContext(this.props.context.id);
    }
  }

  render() {
    const { context } = this.props;
    return (
      <>
        <div
          className={classNames("snippet", {
            clickable: this.props.context && this.props.handleJumpToContext,
          })}
          onClick={this.onClick}
        >
          <RichText>{selectors.cleanTex(this.props.children)}</RichText>
        </div>
        {this.props.handleJumpToContext && context ? (
          <p className="entity-link-message">
            {"See in context on page "}
            <EntityLink
              id={`${this.props.id}-text-link`}
              entityId={context.id}
              handleJumpToEntity={this.props.handleJumpToContext}
            >
              {selectors.readableFirstPageNumber(context)}
            </EntityLink>
            {"."}
          </p>
        ) : null}
      </>
    );
  }
}

export default Snippet;
