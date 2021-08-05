import React from "react";
import { AnswerSentence, PaperQuestion } from "../../../api/types";
import { EntityLink } from "../../common";
import { Entities } from "../../../state";
import { Nullable } from '../../../types/ui';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as selectors from "../../../selectors";



/* very simple gloss that displays simplified version of a highlighted section */
interface Props {
    answer: AnswerSentence;
    entities: Entities;
    handleJumpToEntity: (entityId: string) => void;

  }
  
  
  export default class AnswerSentenceGloss extends React.PureComponent<Props, {}> {
  
    render() {
        let further_detail =
        selectors.adjacentDefinition(this.props.answer.id, this.props.entities, "before") ||
        selectors.adjacentDefinition(this.props.answer.id, this.props.entities, "after");


        let question = this.props.answer.relationships.question.id? this.props.entities.byId[this.props.answer.relationships.question.id] as PaperQuestion : null; 
        const questionHeader = question !== null ? (
            <p className="gloss__header">This section answers the question: <strong>{`${question.attributes.question_text}`}</strong></p>
          ) : (
            null
          );

        const divStyle = {
            overflow: 'scroll',
            maxHeight: '90px',
        };
        const definition = this.props.answer.attributes.simplified_text;

        return (
            <div className="gloss citation-gloss">
                <div className="gloss__section">
                <div className="paper-summary">
                    <div className="paper-summary__section">
                        <p className="paper-summary__title">
                            { questionHeader }
                        </p>
                    </div>
                        <div className="paper-summary__section"> <strong> Simple answer: </strong> { definition } </div> 
                        <EntityLink
                            id={this.props.answer.id ? `${this.props.answer.id}-clickable-link` : undefined}
                            className="subtle"
                            entityId={this.props.answer.relationships.definition_sentences[0].id} // this breaks, it is undefined
                            handleJumpToEntity={this.props.handleJumpToEntity}
                        > Jump to further section. </EntityLink>
                    </div>
                </div>
            </div>
        );
        }
  }    