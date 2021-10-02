import React from "react";
import { DiscourseObj } from "../../api/types";
import * as uiUtils from "../../utils/ui";
import DiscoursePalette from "../discourse/DiscoursePalette";
import FacetSnippet from "./FacetSnippet";

interface Props {
  discourseObjs: DiscourseObj[];
  deselectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
  handleJumpToDiscourseObj: (id: string) => void;
}

export class Facets extends React.PureComponent<Props> {
  render() {
    const { discourseObjs, deselectedDiscourses } = this.props;

    const bySection = uiUtils
      .sortDiscourseObjs(discourseObjs)
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

    return (
      <>
        <div>
          <DiscoursePalette
            discourseToColorMap={uiUtils.getDiscourseToColorMap()}
            discourseObjs={discourseObjs}
            deselectedDiscourses={deselectedDiscourses}
            handleDiscourseSelected={this.props.handleDiscourseSelected}
          ></DiscoursePalette>
        </div>
        <div className="document-snippets discourse-objs">
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
