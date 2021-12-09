import React from "react";
import { DiscourseObj } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import DiscourseTagChip from "./DiscourseTagChip";

const logger = getRemoteLogger();

interface Props {
  discourseToColorMap: { [discourse: string]: string };
  discourseObjs: DiscourseObj[];
  deselectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
}

interface State {
  firstSelection: boolean;
}

const TAG_DISPLAY_NAMES: { [key: string]: string } = {
  Objective: "Objectives",
  Novelty: "Novelty Statements",
  Method: "Methods",
  Result: "Results",
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
    const { deselectedDiscourses } = this.props;

    this.props.handleDiscourseSelected("all");

    // const allTags = this.getAvailableDiscourseTags();
    // /**
    //  * If every tag is already selected, then deselect every tag.
    //  */
    // if (deselectedDiscourses.length === 0) {
    //   for (const clazz of allTags) {
    //     this.props.handleDiscourseSelected(clazz);
    //   }
    // } else {
    //   /**
    //    * Otherwise, select all unselected tags.
    //    */
    //   for (const clazz of allTags) {
    //     if (deselectedDiscourses.indexOf(clazz) !== -1) {
    //       this.props.handleDiscourseSelected(clazz);
    //     }
    //   }
    // }
  };

  getAvailableDiscourseTags = () => {
    const {
      discourseToColorMap,
      discourseObjs,
      deselectedDiscourses,
    } = this.props;
    const selectedDiscourseClasses = [
      ...new Set(discourseObjs.map((x: DiscourseObj) => x.label)),
    ];
    return Object.keys(discourseToColorMap).filter(
      (key) =>
        selectedDiscourseClasses.includes(key) ||
        deselectedDiscourses.includes(key)
    );
  };

  render() {
    const { discourseToColorMap, deselectedDiscourses } = this.props;

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
                  selected={
                    // !beforeFirstSelection && !deselectedDiscourses.includes(d)
                    !deselectedDiscourses.includes(d)
                  }
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
              selected={deselectedDiscourses.length === 0}
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
