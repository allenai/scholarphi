import React from "react";
import { isSentence, Sentence } from "../../api/types";
import { Entities } from "../../state";
import RelevantSnippet from "./RelevantSnippet";

interface Props {
  selectedEntityIds: string[];
  entities: Entities;
  handleJumpToEntity: (id: string) => void;
}

export class RelevantSentences extends React.PureComponent<Props> {
  render() {
    const { selectedEntityIds, entities } = this.props;

    const relevantSentences = selectedEntityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter((e) => isSentence(e))
      .map((e) => e as Sentence);

    const relevantSentencesByPage = relevantSentences.reduce(
      (acc: { [page: number]: Sentence[] }, sent) => {
        const page = sent.attributes.bounding_boxes[0].page;
        if (!acc[page]) {
          acc[page] = [];
        }
        acc[page].push(sent);
        return acc;
      },
      {}
    );

    return (
      <div className="document-snippets relevant-sentences">
        <p className="drawer__content__header">Related Content</p>
        {selectedEntityIds.length > 0 && (
          <p>
            {relevantSentences.length === 0
              ? `No related text found.`
              : `Showing ${relevantSentences.length} related sentence${
                  relevantSentences.length === 1 ? "" : "s"
                }.`}
          </p>
        )}
        {Object.entries(relevantSentencesByPage).map(([page, sents], i) => (
          <React.Fragment key={i}>
            <p className="relevant-sentence-page-header">
              Page {parseInt(page) + 1}
            </p>
            {sents.map((sent) => (
              <RelevantSnippet
                key={sent.id}
                id={sent.id}
                context={sent}
                handleJumpToContext={this.props.handleJumpToEntity}
                mostRelevantId={
                  relevantSentences.length > 0
                    ? relevantSentences[0].id
                    : undefined
                }
              >
                {sent.attributes.tex!}
              </RelevantSnippet>
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  }
}

export default RelevantSentences;
