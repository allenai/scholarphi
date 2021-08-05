import { DrawerContentType } from "../../drawer/Drawer";
import { getRemoteLogger } from "../../../logging";
import { EntityPageLink, RichText } from "../../common";
import * as selectors from "../../../selectors";
import { Entities } from "../../../state";
import { Term, PaperQuestion } from "../../../api/types";

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
  showDrawerActions?: boolean;
  handleOpenDrawer: (contentType: DrawerContentType) => void;
  handleJumpToEntity: (entityId: string) => void;
}

interface State {
  closed: boolean;
}

/**
 * A question for a paper that links to a specific area in a document, 
 * This is heavily based on SimpleTermGloss .
 */


class PaperQuestionGloss extends React.PureComponent<Props, State> {
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
    this.props.handleOpenDrawer("usages");
  }

  onClickClose() {
    logger.log("debug", "clicked-dismiss-term-tooltip");
    this.setState({ closed: true });
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

    /*
     * Find most recent definition.
     */
    return (
      <div
        className={classNames("gloss", "term-gloss", "simple-gloss", {
          "with-action-buttons": this.props.showDrawerActions,
          closed: this.state.closed,
        })}
      >
        <table>
          <tbody>
            <tr>
              {(definedHere || definition) && (
                <td>
                  <div className="simple-gloss__definition-container">
                    {definedHere && <p>Defined here.</p>}
                    {!definedHere && definition !== null && (
                      <p>
                        {definition !== null && (
                          <>
                            <RichText>{`${this.props.question.attributes.question_text}`}</RichText>{" "}
                            <EntityPageLink
                              id={`term-${question.id}-definition-link`}
                              entity={definition.contextEntity}
                              handleJumpToEntity={this.props.handleJumpToEntity}
                            />
                            {"."}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </td>
              )}
              {this.props.showDrawerActions && (
                <React.Fragment>
                  <td>
                    <MuiTooltip
                      title={
                        usages.length > 0
                          ? `See ${usages.length} usages`
                          : "No usages."
                      }
                    >
                      <IconButton
                        size="small"
                        disabled={usages.length === 0}
                        onClick={this.onClickUsagesButton}
                      >
                        <Toc />
                      </IconButton>
                    </MuiTooltip>
                  </td>
                  <td>
                    <MuiTooltip title="Dismiss">
                      <IconButton size="small" onClick={this.onClickClose}>
                        <Close />
                      </IconButton>
                    </MuiTooltip>
                  </td>
                </React.Fragment>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default PaperQuestionGloss;

