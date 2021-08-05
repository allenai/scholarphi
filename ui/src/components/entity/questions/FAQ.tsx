import { DrawerContentType } from "../../drawer/Drawer";
import { getRemoteLogger } from "../../../logging";
import { EntityPageLink, RichText, EntityLink } from "../../common";
import * as selectors from "../../../selectors";
import { Entities } from "../../../state";
import { Term, PaperQuestion } from "../../../api/types";
import ReactDOM from "react-dom";


import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import Toc from "@material-ui/icons/Toc";
import classNames from "classnames";
import React from "react";


const logger = getRemoteLogger();

interface Props {
  question: PaperQuestion;
  entities: Entities;
  handleJumpToEntity: (entityId: string) => void;
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
  
    render() {
      const { entities, question } = this.props;
  
      /*
       * Try to find definition and nickname right before the symbol.
       */
      let definition =
        selectors.adjacentDefinition(question.id, entities, "before") ||
        selectors.adjacentDefinition(question.id, entities, "after");
  
      console.log("definition:", definition);
  
      const definedHere = selectors.inDefinition(question.id, entities);
  
      if (!definedHere && definition === null) {
        return null;
      }
  
      const usages = selectors.usages([question.id], entities);
      const FAQsContainer = document.getElementById(
        "FAQsView"
      );
      console.log("usages:", usages);
  
      /*
       * Find most recent definition.
       */
      return FAQsContainer
      ? ReactDOM.createPortal(
        <div
          className={classNames("gloss", "faq-gloss", "simple-gloss")}
        >
          <table>
            <tbody>
              <tr>
                {(definedHere || definition) && (
                  <td>
                    <div className="simple-gloss__definition-container">
                      {definedHere && <p>Defined here.</p>}
                      {!definedHere && definition !== null && (
                        <div>
                          {definition !== null && (
                            <>
                              <p className="gloss__header">{`${this.props.question.attributes.question_text}`}</p>


                              <span className="gloss__section">{`${this.props.question.attributes.answer_text}`}</span>
                              <EntityLink
                                id={`term-${question.id}-definition-link`}
                                className="subtle"
                                entityId={definition.contextEntity.id}
                                handleJumpToEntity={this.props.handleJumpToEntity}
                                > Jump to section </EntityLink>{"."}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>, FAQsContainer)
     : null;
    }
  }
  
  export default FAQ;
  

