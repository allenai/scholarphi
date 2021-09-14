import React from "react";
import {
  AnswerSentence,
  PaperQuestion,
  Relationship,
} from "../../../api/types";
import * as selectors from "../../../selectors";
import { Entities } from "../../../state";
import { EntityLink } from "../../common";

/* very simple gloss that displays simplified version of a highlighted section */
interface Props {
  answer: AnswerSentence;
  entities: Entities;
  handleJumpToEntity: (entityId: string) => void;
}

export default class AnswerSentenceGloss extends React.PureComponent<
  Props,
  {}
> {
  render() {
    let further_detail =
      selectors.adjacentDefinition(
        this.props.answer.id,
        this.props.entities,
        "before"
      ) ||
      selectors.adjacentDefinition(
        this.props.answer.id,
        this.props.entities,
        "after"
      );

    let question = this.props.answer.relationships.question.id
      ? (this.props.entities.byId[
          this.props.answer.relationships.question.id
        ] as PaperQuestion)
      : null;
    const questionHeader =
      question !== null ? (
        <p className="gloss__header">
          This section answers the question:{" "}
          <strong>{`${question.attributes.question_text}`}</strong>
        </p>
      ) : null;

    // if the length of the coaster is longer than 0 then
    // (1) find the index of this answer in the coaster and
    // (2) make an indicator element for the gloss
    let coaster = this.props.answer.relationships.coaster as Relationship[];
    let coasterIndicator = null;

    if (coaster.length > 0) {
      // function for getting index of this answer in the coaster
      const isThisAnswer = (element: Relationship) =>
        element["id"] === this.props.answer["id"];
      const thisAnswerIndex = coaster.findIndex(isThisAnswer);
      coasterIndicator = (
        <span>
          {" "}
          {thisAnswerIndex + 1} of {coaster.length} answers.{" "}
        </span>
      );
    }

    let detailJump = this.props.answer.relationships.more_details.id ? (
      <EntityLink
        id={
          this.props.answer.id
            ? `${this.props.answer.id}-clickable-link`
            : undefined
        }
        className="subtle"
        entityId={this.props.answer.relationships.more_details.id}
        handleJumpToEntity={this.props.handleJumpToEntity}
      >
        {" "}
        {">>"}{" "}
      </EntityLink>
    ) : null;

    let backJump = this.props.answer.relationships.less_details.id ? (
      <EntityLink
        id={
          this.props.answer.id
            ? `${this.props.answer.id}-clickable-link`
            : undefined
        }
        className="subtle"
        entityId={this.props.answer.relationships.less_details.id}
        handleJumpToEntity={this.props.handleJumpToEntity}
      >
        {" "}
        {"<<"}{" "}
      </EntityLink>
    ) : null;

    const divStyle = {
      overflow: "scroll",
      maxHeight: "90px",
    };
    const definition = this.props.answer.attributes.simplified_text;
    console.log(this.props.answer);
    return (
      <div className="gloss citation-gloss">
        <div className="gloss__section">
          <div className="paper-summary">
            {/* <div className="paper-summary__section">
                        <p className="paper-summary__title">
                            { questionHeader }
                        </p>
                    </div> */}
            <div className="paper-summary__section">
              {" "}
              {/* <strong> Simple answer: </strong> {definition}{" "} */}
              {/* <strong>The gist:</strong> {definition} */}
              <span className="summary-name">The gist:</span> {definition}
            </div>
            <p>
              {" "}
              {backJump} {coasterIndicator} {detailJump}{" "}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
