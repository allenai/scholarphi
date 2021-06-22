import classNames from "classnames";
import React from "react";
import { Entity } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as selectors from "../../selectors";
import { RichText } from "../common";

const logger = getRemoteLogger();

interface Props {
  id: string;
  context?: Entity;
  handleJumpToContext?: (contextEntityId: string) => void;
  mostRelevantId?: string;
  color?: string;
  children: string;
}

class RelevantSnippet extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  onClick = () => {
    logger.log("debug", "clicked-jump-to-snippet-context", {
      contextEntity: this.props.context,
    });
    if (this.props.handleJumpToContext && this.props.context) {
      this.props.handleJumpToContext(this.props.context.id);
    }
  };

  render() {
    const { id, context, children, color, mostRelevantId } = this.props;
    return (
      <>
        <div
          className={classNames("snippet", {
            clickable: context && this.props.handleJumpToContext,
            // The following attribute adds a dotted outline to the snippet
            // of the sentence with the highest probability of relevance.
            // "most-relevant": mostRelevantId === id,
          })}
          style={{border: `2px solid ${color}`}}
          onClick={this.onClick}
        >
          <RichText>{selectors.cleanTex(children)}</RichText>
        </div>
      </>
    );
  }
}

export default RelevantSnippet;
