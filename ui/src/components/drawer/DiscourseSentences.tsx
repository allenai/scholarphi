import React from "react";
import { isSentence, Sentence } from "../../api/types";
import { Entities } from "../../state";
import RelevantSnippet from "./RelevantSnippet";

interface Props {
  entities: Entities;
  discourseTags: { [id: string]: string | undefined };
  customDiscourseTags: { [id: string]: string | undefined };
  discourseToColorMap: { [discourse: string]: string };
  deselectedDiscourses: string[];
  handleJumpToEntity: (id: string) => void;
}

export class DiscourseSentences extends React.PureComponent<Props> {
  render() {
    const {
      entities,
      discourseTags,
      customDiscourseTags,
      discourseToColorMap,
      deselectedDiscourses,
    } = this.props;

    const relevantSentences = Object.entries({
      ...discourseTags,
      ...customDiscourseTags,
    })
      .filter(([_, discourse]) => {
        if (discourse !== undefined) {
          return !deselectedDiscourses.includes(discourse);
        }
      })
      .map((x) => x[0])
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
      <div className="document-snippets discourse-sentences">
        {Object.entries(relevantSentencesByPage).map(([page, sents], i) => (
          <React.Fragment key={i}>
            <p className="relevant-sentence-page-header">
              Page {parseInt(page) + 1}
            </p>
            {sents.map((sent) => {
              let color = undefined;
              if (sent.id !== undefined) {
                const discourse =
                  discourseTags[sent.id] || customDiscourseTags[sent.id];
                if (discourse !== undefined) {
                  color = discourseToColorMap[discourse];
                }
              }
              if (sent.attributes.text !== null) {
                return (
                  <RelevantSnippet
                    key={sent.id}
                    id={sent.id}
                    context={sent}
                    color={color}
                    handleJumpToContext={this.props.handleJumpToEntity}
                    mostRelevantId={
                      relevantSentences.length > 0
                        ? relevantSentences[0].id
                        : undefined
                    }
                  >
                    {sent.attributes.text}
                  </RelevantSnippet>
                );
              }
            })}
          </React.Fragment>
        ))}
      </div>
    );
    return <div></div>;
  }
}

export default DiscourseSentences;
