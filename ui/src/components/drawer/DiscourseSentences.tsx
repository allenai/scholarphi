import Chip from "@material-ui/core/Chip";
import classNames from "classnames";
import React from "react";
import { isSentence, Sentence } from "../../api/types";
import { Entities } from "../../state";
import * as uiUtils from "../../utils/ui";
import RelevantSnippet from "./RelevantSnippet";

interface Props {
  entities: Entities;
  discourseTags: { [id: string]: string | undefined };
  discourseToColorMap: { [discourse: string]: string };
  deselectedDiscourses: string[];
  handleJumpToEntity: (id: string) => void;
  handleClickDiscourseChip: (discourse: string) => void;
}

export class DiscourseSentences extends React.PureComponent<Props> {
  render() {
    const {
      entities,
      discourseTags,
      discourseToColorMap,
      deselectedDiscourses,
    } = this.props;

    const relevantSentences = Object.entries(discourseTags)
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

    const readSentences = uiUtils.getReadSentences();
    const activeDiscourses = [...new Set(Object.values(discourseTags))];

    return (
      <div className="document-snippets discourse-sentences">
        <div className={"discourse-chip-palette"}>
          {activeDiscourses.map((d) => {
            if (d !== undefined) {
              return (
                <Chip
                  className={classNames("discourse-chip", {
                    deselected: deselectedDiscourses.includes(d),
                  })}
                  label={<span className={"discourse-chip-label"}>{d}</span>}
                  key={d}
                  onClick={() => this.props.handleClickDiscourseChip(d)}
                  style={{ backgroundColor: discourseToColorMap[d!] }}
                  variant="outlined"
                />
              );
            }
          })}
        </div>

        {Object.entries(relevantSentencesByPage).map(([page, sents], i) => (
          <React.Fragment key={i}>
            <p className="relevant-sentence-page-header">
              Page {parseInt(page) + 1}
            </p>
            {sents.map((sent) => {
              let color = undefined;
              if (sent.id !== undefined) {
                const discourse = discourseTags[sent.id];
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
                    markedAsRead={readSentences.includes(sent.id)}
                    color={
                      color !== undefined
                        ? uiUtils.addAlpha(color, 0.3)
                        : undefined
                    }
                    handleJumpToContext={(id) => {
                      this.props.handleJumpToEntity(id);
                      uiUtils.markHighlightAsRead(id, /** toggle= */ false);
                    }}
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
  }
}

export default DiscourseSentences;
