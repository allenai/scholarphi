import classNames from "classnames";
import React from "react";
import { AnswerSentence, PaperQuestion, Relationship } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as selectors from "../../selectors";
import { Entities } from "../../state";
import { EntityLink } from "../common";

const logger = getRemoteLogger();

interface Props {
  question: PaperQuestion;
  entities: Entities;
  isSelected: boolean;
  isHovered: boolean;
  handleJumpToEntity: (entityId: string) => void;
  handleMouseOver: (entityId: string) => void;
  handleMouseOut: (entityId: string) => void;
  handleClick: (entityId: string) => void;
}

interface State {
  closed: boolean;
}

/**
 * A question for a paper that links to a specific area in a document,
 * This is heavily based on SimpleTermGloss and similar to PaperQuestionGloss, but
 * instead get's rendered in a sidebar
 */

class FAQ extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      closed: false,
    };
    this.onClickUsagesButton = this.onClickUsagesButton.bind(this);
    this.onClickClose = this.onClickClose.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  componentDidMount() {
    logger.log("debug", "rendered-term-tooltip", {
      question: this.props.question.id,
    });
  }

  onClickUsagesButton() {
    logger.log("debug", "clicked-open-term-usages");
  }

  onClickClose() {
    logger.log("debug", "clicked-dismiss-term-tooltip");
  }

  onMouseEnter() {
    this.props.handleMouseOver(this.props.question.id);
  }

  onMouseLeave() {
    this.props.handleMouseOut(this.props.question.id);
  }

  onClick() {
    this.props.handleClick(this.props.question.id);
  }

  render() {
    const { entities, question } = this.props;

    /*
     * Try to find definition and nickname right before the symbol.
     */
    let definition =
      selectors.adjacentDefinition(question.id, entities, "before") ||
      selectors.adjacentDefinition(question.id, entities, "after");

    const definedHere = selectors.inDefinition(question.id, entities);

    if (!definedHere && definition === null) {
      return null;
    }

    const usages = selectors.usages([question.id], entities);
    const FAQsContainer = document.getElementById("FAQsView");

    // display the whole coaster
    const firstAnswer = definition
      ? (definition.contextEntity as AnswerSentence)
      : null;
    const answerCoaster = firstAnswer
      ? (firstAnswer.relationships.coaster as Relationship[])
      : null;

    const answerEntities = answerCoaster
      ? answerCoaster.map((a) => {
          if (typeof a.id === "string") {
            return this.props.entities.byId[a.id];
          } else {
            return null;
          }
        })
      : null;
    // const answerEntities = typeof(answerIds) === 'object'? this.props.entities.byId[[answerIds]]: null;
    // yes this is very hacky: getting entity annotation ids for the answers to highlight them

    const answerAnnotations =
      answerEntities !== null && answerEntities.length > 0
        ? answerEntities.map((a) => {
            let elementId = a
              ? (`entity-${a.id}-page-${a.attributes.bounding_boxes[0].page}-annotation-span-0` as string)
              : null;
            return elementId ? document.getElementById(elementId) : null;
          })
        : null;


    let details = null;

    const generalAnswer = definition ? (
      <EntityLink
        id={`term-${question.id}-definition-link`}
        className="subtle"
        entityId={definition.contextEntity.id}
        handleJumpToEntity={this.props.handleJumpToEntity}
      >
        {" "}
        Jumpt to text{" "}
      </EntityLink>
    ) : null;

    if (answerCoaster !== null && answerCoaster.length > 0) {
      details = answerCoaster.slice(1).map((answer, i) => {
        return (
          <EntityLink
            id={answer.id ? `${answer.id}-clickable-link` : undefined}
            className="subtle"
            entityId={answer.id}
            handleJumpToEntity={this.props.handleJumpToEntity}
          >
            {" "}
            1{" "}
          </EntityLink>
        );
      });
    }

    const FAQClass = this.props.isSelected ? "faq-selected" : "faq";

    // const FAQClassHovered = this.props.isHovered ? "faq-hovered" : "faq";

    // render the FAQs in the sidebar with a portal
    return (
      <div
        // Handle hover through pseudoselectors.
        // className={classNames("faq", FAQClass, FAQClassHovered)}
        className={classNames("faq", FAQClass)}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <p className="faq__question">{`${this.props.question.attributes.question_text}`}</p>
        <p className="faq__answer">{`${this.props.question.attributes.answer_text}`}</p>
        {generalAnswer} {"."}
        {details !== null && <span> Relevant passage(s): {details}</span>}
      </div>
    );
  }
}

export default FAQ;
