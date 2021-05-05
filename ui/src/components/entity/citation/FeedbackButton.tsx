import { createFeedbackLink, openFeedbackWindow } from "../../../utils/feedback";
import { PaperId } from "../../../state";

import Button from "@material-ui/core/Button";
import FeedbackIcon from "@material-ui/icons/FeedbackOutlined";
import React from "react";

interface Props {
  paperId?: PaperId;
  variant?: ButtonVariant;
  extraContext?: object;
}

/**
 * Controls the visual appearance of the button. The toolbar variant mimics
 * the appearance of buttons rendered by the default PDF viewing experience.
 */
type ButtonVariant = "default" | "toolbar";

const FeedbackButton = ({ variant, extraContext, paperId }: Props) => {
  switch (variant) {
    case "toolbar": {
      return (
        <button
          onClick={() =>
            openFeedbackWindow(createFeedbackLink(paperId, extraContext))
          }
          className="toolbarButton hiddenLargeView toolbar__feedback-button"
          title="Submit Feedback"
        >
          <FeedbackIcon />
          <span>Submit Feedback</span>
        </button>
      );
    }
    case "default":
    default: {
      return (
        <Button
          onClick={() =>
            openFeedbackWindow(createFeedbackLink(paperId, extraContext))
          }
          className="feedback-button"
        >
          <FeedbackIcon />
        </Button>
      );
    }
  }
};

export default FeedbackButton;
