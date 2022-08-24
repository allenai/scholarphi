import React from "react";
import { DiscourseObj } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";
import DiscourseTagChip from "./DiscourseTagChip";

const logger = getRemoteLogger();

interface Props {
  allDiscourseObjs: DiscourseObj[];
  selectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
}

interface State {
  firstSelection: boolean;
}

class DiscoursePalette extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  onClickTag = (tag: string) => {
    logger.log("debug", "click-facet-tag", { tag: tag });
    this.props.handleDiscourseSelected(tag);
  };

  onClickEverything = () => {
    logger.log("debug", "click-all-facets-tag");
    this.props.handleDiscourseSelected("all");
  };

  getAvailableFacets = () => {
    return ["objective", "novelty", "method", "result"];
  };

  render() {
    const { selectedDiscourses, allDiscourseObjs } = this.props;

    const facetDisplayNames = uiUtils.getFacetDisplayNames();
    const facetColors = uiUtils.getFacetColors();

    return (
      <div className="discourse-chip-palette-wrapper">
        <p className="discourse-palette-header">Show me...</p>
        <div className="discourse-chip-palette">
          <div className="discourse-chip-palette__tags">
            {this.getAvailableFacets().map((facet) => {
              return (
                <DiscourseTagChip
                  key={facet}
                  id={facet}
                  name={`${facetDisplayNames[facet] || facet} (${
                    allDiscourseObjs.filter((x) => x.label === facet).length
                  })`}
                  selected={selectedDiscourses.includes(facet)}
                  color={facetColors[facet]}
                  handleSelection={this.onClickTag}
                />
              );
            })}
          </div>
          <div className="discourse-chip-palette__everything">
            <DiscourseTagChip
              id="everything"
              className="everything-chip"
              name={"Everything"}
              selected={selectedDiscourses.length > 0}
              color={"lightgray"}
              handleSelection={this.onClickEverything}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DiscoursePalette;
