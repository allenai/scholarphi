import { getRemoteLogger } from "../../logging";
import { EntityLink, RichText } from "../common";
import * as selectors from "../../selectors";
import { Entity } from "../../api/types";

import classNames from "classnames";
import React from "react";

const logger = getRemoteLogger();

interface Props {
  id: string;
  context?: Entity;
  handleJumpToContext?: (contextEntityId: string) => void;
  children: string;
  score?: number | null;
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
    const score: number | null = this.props.score ?? null;

    const formattedScore: string | null =
      score != null ?
      Intl.NumberFormat(
        'en-US',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      ).format(score) :
      null;

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
        {score != null ? (
           <p className="entity-link-message">
             {"Snipped Score: "}
             <b>{formattedScore}</b>
           </p>
         ): null}
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

// {score != null ? (
//           <p className="score-message">
//             {"Snipped Score: " + score}
//           </p>
//         ): null}