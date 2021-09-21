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
  handleIncreaseNumHighlights: (discourse: string) => void;
  handleDecreaseNumHighlights: (discourse: string) => void;
}

export class Facets extends React.PureComponent<Props> {
  render() {
    const { discourseObjs, deselectedDiscourses } = this.props;

    const byPage = discourseObjs.reduce(
      (acc: { [page: number]: DiscourseObj[] }, d: DiscourseObj) => {
        const page = d.bboxes[0].page;
        if (!acc[page]) {
          acc[page] = [];
        }
        acc[page].push(d);
        return acc;
      },
      {}
    );

    return (
      <>
        <div>
          <DiscoursePalette
            discourseToColorMap={uiUtils.getDiscourseToColorMap()}
            discourseObjs={discourseObjs}
            deselectedDiscourses={deselectedDiscourses}
            handleDiscourseSelected={this.props.handleDiscourseSelected}
            handleIncreaseNumHighlights={this.props.handleIncreaseNumHighlights}
            handleDecreaseNumHighlights={this.props.handleDecreaseNumHighlights}
          ></DiscoursePalette>
        </div>
        <div className="document-snippets discourse-objs">
          {Object.entries(byPage).map(([page, ds], pageIdx: number) => (
            <React.Fragment key={pageIdx}>
              <p className="discourse-page-header">Page {page}</p>
              {ds.map((d: DiscourseObj) => (
                <FacetSnippet
                  key={d.id}
                  id={d.id}
                  color={d.color}
                  handleJumpToDiscourseObj={this.props.handleJumpToDiscourseObj}
                >
                  {d.entity.text}
                </FacetSnippet>
              ))}
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }
}

export default Facets;
