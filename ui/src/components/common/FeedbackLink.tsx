import { createFeedbackLink, openFeedbackWindow } from "../../utils/feedback";
import { PaperId } from "../../state";

import React from "react";

interface Props {
  text: string;
  paperId?: PaperId;
  extraContext?: object;
}

/**
 * Controls the visual appearance of the button. The toolbar variant mimics
 * the appearance of buttons rendered by the default PDF viewing experience.
 */

const FeedbackLink = ({ text, extraContext, paperId }: Props) => {
  return (
    <a href="#" onClick={() =>
      openFeedbackWindow(createFeedbackLink(paperId, extraContext))
    }>
      {text}
    </a>
  );
};

export default FeedbackLink;
