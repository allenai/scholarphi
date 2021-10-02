import React from "react";
import { DiscourseObj } from "../../api/types";
import DiscourseTagChip from "./DiscourseTagChip";

interface Props {
  discourseToColorMap: { [discourse: string]: string };
  discourseObjs: DiscourseObj[];
  deselectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
}

const TAG_DISPLAY_NAMES: { [key: string]: string } = {
  Objective: "Objectives",
  Novelty: "Novelty Statements",
  Method: "Methods",
};
class DiscoursePalette extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  onClickEverything = () => {
    const { deselectedDiscourses } = this.props;
    const allTags = this.getAvailableDiscourseTags();
    /**
     * If every tag is already selected, then deselect every tag.
     */
    if (deselectedDiscourses.length === 0) {
      for (const clazz of allTags) {
        this.props.handleDiscourseSelected(clazz);
      }
    } else {
      /**
       * Otherwise, select all unselected tags.
       */
      for (const clazz of allTags) {
        if (deselectedDiscourses.indexOf(clazz) !== -1) {
          this.props.handleDiscourseSelected(clazz);
        }
      }
    }
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
    const hidden = ["Highlight", "Author"];
    return Object.keys(discourseToColorMap)
      .filter((key) => !hidden.includes(key))
      .filter(
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
                  id={d}
                  name={TAG_DISPLAY_NAMES[d] || d}
                  selected={!deselectedDiscourses.includes(d)}
                  color={color}
                  handleSelection={this.props.handleDiscourseSelected}
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
