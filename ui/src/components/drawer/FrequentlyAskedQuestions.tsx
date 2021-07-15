import React from "react";
import { isSentence, Sentence } from "../../api/types";
import { Entities } from "../../state";
import RelevantSnippet from "./RelevantSnippet";

interface Props {
  faqs: { [id: string]: string };
  entities: Entities;
  handleJumpToEntity: (id: string) => void;
}

const shortToLongFAQName: { [shortName: string]: string } = {
  stateOfTheWorld: "State of the world",
  goal: "Research Goals",
  contr: "Contributions",
  prior: "Comparison to prior work",
  model: "Models",
  technique: "Techniques",
  hypothesis: "Hypotheses",
  baseline: "Baselines",
  metric: "Metrics",
  study: "Study Details",
  factor: "Factors",
  result: "Results",
  future: "Future Work",
};

export class DiscourseSentences extends React.PureComponent<Props> {
  getIdsForClass = (faqClass: string) => {
    const { faqs } = this.props;
    return Object.keys(faqs).filter((k) => faqs[k] === faqClass);
  };

  render() {
    const { entities } = this.props;

    return (
      <div className="document-snippets relevant-sentences">
        {Object.keys(shortToLongFAQName).map((faqClass: string) => {
          const header = shortToLongFAQName[faqClass];
          const ids = this.getIdsForClass(faqClass);
          const sentences = ids
            .map((id) => entities.byId[id])
            .filter((e) => e !== undefined)
            .filter((e) => isSentence(e))
            .map((e) => e as Sentence);

          return (
            <React.Fragment key={faqClass}>
              {ids.length > 0 && (
                <p className="drawer__content__header">{header}</p>
              )}
              {sentences.map((sent: Sentence) => (
                <RelevantSnippet
                  key={sent.id}
                  id={sent.id}
                  context={sent}
                  handleJumpToContext={this.props.handleJumpToEntity}
                >
                  {sent.attributes.tex!}
                </RelevantSnippet>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}

export default DiscourseSentences;
