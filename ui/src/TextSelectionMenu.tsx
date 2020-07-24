import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import React from "react";
import ReactDOM from "react-dom";
import { getRemoteLogger } from "./logging";
import { Pages } from "./state";
import * as uiUtils from "./utils/ui";

interface Props {
  pages: Pages;
  textSelection: Selection | null;
  handleShowSnackbarMessage: (message: string) => void;
}

const logger = getRemoteLogger();

/**
 * Toolbar that supports the creation of new entities by annotating the paper. Allows
 * users to create annotations of papers from text selections.
 */
class TextSelectionMenu extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClickRequestExplanation = this.onClickRequestExplanation.bind(this);
  }

  onClickRequestExplanation() {
    const selection = this.props.textSelection;
    if (selection === null) {
      return;
    }

    const boundingBoxes = uiUtils.getBoundingBoxesForSelection(
      selection,
      this.props.pages
    );

    logger.log("debug", "request-explanation", {
      selectedText: selection !== null ? selection.toString() : null,
      boundingBoxes,
    });

    this.props.handleShowSnackbarMessage(
      "Thanks! Your request for an explanation has been submitted."
    );
  }

  render() {
    if (
      this.props.textSelection === null ||
      this.props.textSelection.rangeCount === 0 ||
      this.props.textSelection.toString() === ""
    ) {
      return null;
    }

    /*
     * Menu is placed beneath the last selected range.
     */
    const selection = this.props.textSelection;
    const range = selection.getRangeAt(selection.rangeCount - 1);
    const page = uiUtils.getPageContainingNode(
      range.commonAncestorContainer,
      this.props.pages
    );

    if (page === null) {
      return null;
    }

    const rangeRect = range.getBoundingClientRect();
    const pageRect = page.view.div.getBoundingClientRect();

    return ReactDOM.createPortal(
      <Card
        className="text-selection-menu"
        raised={true}
        style={{
          /*
           * Center the menu horizontally beneath the selected range.
           */
          left: rangeRect.left - pageRect.left + rangeRect.width / 2,
          transform: "translate(-50%, 0)",
          top: rangeRect.bottom - pageRect.top,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={this.onClickRequestExplanation}
        >
          I want an explanation of this
        </Button>
      </Card>,
      page.view.div
    );
  }
}

export default TextSelectionMenu;
