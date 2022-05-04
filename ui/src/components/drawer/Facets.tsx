import React from "react";
import { DiscourseObj } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";
import DiscoursePalette from "../discourse/DiscoursePalette";
import FacetSnippet from "./FacetSnippet";

const logger = getRemoteLogger();

interface Props {
  discourseObjs: DiscourseObj[];
  leadSentenceObjs: DiscourseObj[];
  selectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
  handleJumpToDiscourseObj: (id: string) => void;
}

export class Facets extends React.PureComponent<Props> {
  handleFacetSnippetClicked = (sentence: DiscourseObj) => {
    logger.log("debug", "click-facet-snippet", {
      discourse: sentence,
    });
    if (this.props.handleJumpToDiscourseObj) {
      this.clearAllSelected();
      this.markAsSelected(`facet-snippet-${sentence.id}`);
      this.markAsSelected(`highlight-${sentence.id}`);

      this.props.handleJumpToDiscourseObj(sentence.id);
    }
  };

  markAsSelected = (classname: string) => {
    uiUtils.addClassToElementsByClassname(classname, "selected");
  };

  clearAllSelected = () => {
    uiUtils.removeClassFromElementsByClassname("selected");
  };

  render() {
    const { leadSentenceObjs, discourseObjs, selectedDiscourses } = this.props;

    const bySection = uiUtils
      .sortDiscourseObjs([...discourseObjs, ...leadSentenceObjs])
      .reduce((acc: { [section: string]: DiscourseObj[] }, d: DiscourseObj) => {
        // The section attribute contains (when they exist) section, subsection, and
        // subsubsection header data, delimited by "@@".
        const long_section = d.entity.section;
        const section = long_section.split("@@").pop() || "";
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(d);
        return acc;
      }, {});

    // We want to hide the palette and shift the snippets up when only lead sentences are shown
    const showFacetHighlights =
      discourseObjs.length > 0 || selectedDiscourses.length === 0;

    return (
      <>
        {showFacetHighlights && (
          <div>
            <DiscoursePalette
              discourseToColorMap={uiUtils.getDiscourseToColorMap()}
              discourseObjs={discourseObjs}
              selectedDiscourses={selectedDiscourses}
              handleDiscourseSelected={this.props.handleDiscourseSelected}
            ></DiscoursePalette>
          </div>
        )}
        <div
          className="document-snippets discourse-objs"
          style={{ marginTop: showFacetHighlights ? "9em" : 0 }}
        >
          {Object.entries(bySection).map(
            ([section, ds], sectionIdx: number) => {
              return (
                <React.Fragment key={sectionIdx}>
                  <p className="discourse-page-header">{section}</p>
                  {uiUtils.sortDiscourseObjs(ds).map((d: DiscourseObj) => {
                    return (
                      <FacetSnippet
                        key={d.id}
                        id={d.id}
                        color={d.color}
                        onClick={() => this.handleFacetSnippetClicked(d)}
                        handleJumpToDiscourseObj={
                          this.props.handleJumpToDiscourseObj
                        }
                      >
                        {d.entity.text}
                      </FacetSnippet>
                    );
                  })}
                </React.Fragment>
              );
            }
          )}
        </div>
      </>
    );
  }
}

export default Facets;
