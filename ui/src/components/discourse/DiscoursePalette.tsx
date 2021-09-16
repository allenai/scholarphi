import Chip from "@material-ui/core/Chip";
import classNames from "classnames";
import React from "react";
import { DiscourseObj } from "../../api/types";

interface Props {
  discourseToColorMap: { [discourse: string]: string };
  discourseObjs: DiscourseObj[];
  deselectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
}

class DiscoursePalette extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      discourseToColorMap,
      discourseObjs,
      deselectedDiscourses,
    } = this.props;

    const availableDiscourseClasses = [
      ...new Set(discourseObjs.map((x: DiscourseObj) => x.label)),
    ];
    const hidden = ["Highlight", "Author"];
    const filteredDiscourseToColorMap = Object.keys(discourseToColorMap)
      .filter((key) => !hidden.includes(key))
      .filter((key) => availableDiscourseClasses.includes(key))
      .reduce((obj: { [label: string]: string }, key) => {
        obj[key] = discourseToColorMap[key];
        return obj;
      }, {});

    return (
      <div className={"discourse-chip-palette-wrapper"}>
        <div className={"discourse-chip-palette"}>
          {Object.entries(filteredDiscourseToColorMap).map(([d, color]) => (
            <Chip
              className={classNames("discourse-chip", {
                deselected: deselectedDiscourses.includes(d),
              })}
              label={<span className={"discourse-chip-label"}>{d}</span>}
              key={d}
              onClick={() => this.props.handleDiscourseSelected(d)}
              style={{ backgroundColor: color }}
              variant="outlined"
            />
          ))}
        </div>
      </div>
    );
  }
}

export default DiscoursePalette;
