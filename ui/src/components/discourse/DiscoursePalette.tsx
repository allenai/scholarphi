import React from "react";
import { DiscourseObj } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import DiscourseTagChip from "./DiscourseTagChip";

const logger = getRemoteLogger();

interface Props {
  discourseToColorMap: { [discourse: string]: string };
  discourseObjs: DiscourseObj[];
  selectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
}

interface State {
  firstSelection: boolean;
}

const TAG_DISPLAY_NAMES: { [key: string]: string } = {
  objective: "Objectives",
  novelty: "Novelty Statements",
  method: "Methods",
  result: "Results",
};
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

  getAvailableDiscourseTags = () => {
    return ["objective", "novelty", "method", "result"];
  };

  render() {
    const { discourseToColorMap, selectedDiscourses } = this.props;

    const filteredDiscourseToColorMap = this.getAvailableDiscourseTags().reduce(
      (obj: { [label: string]: string }, key) => {
        obj[key] = discourseToColorMap[key];
        return obj;
      },
      {}
    );

    return (
      <div className="discourse-chip-palette-wrapper">
        <p className="discourse-palette-header">Show me...</p>
        <div className="discourse-chip-palette">
          <div className="discourse-chip-palette__tags">
            {Object.entries(filteredDiscourseToColorMap).map(([d, color]) => {
              return (
                <DiscourseTagChip
                  key={d}
                  id={d}
                  name={TAG_DISPLAY_NAMES[d] || d}
                  selected={selectedDiscourses.includes(d)}
                  color={color}
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
