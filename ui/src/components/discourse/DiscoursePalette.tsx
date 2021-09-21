import Chip from "@material-ui/core/Chip";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import classNames from "classnames";
import React from "react";
import { DiscourseObj } from "../../api/types";

interface Props {
  discourseToColorMap: { [discourse: string]: string };
  discourseObjs: DiscourseObj[];
  deselectedDiscourses: string[];
  handleDiscourseSelected: (discourse: string) => void;
  handleIncreaseNumHighlights: (discourse: string) => void;
  handleDecreaseNumHighlights: (discourse: string) => void;
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
      .filter(
        (key) =>
          availableDiscourseClasses.includes(key) ||
          deselectedDiscourses.includes(key)
      )
      .reduce((obj: { [label: string]: string }, key) => {
        obj[key] = discourseToColorMap[key];
        return obj;
      }, {});

    return (
      <div className={"discourse-chip-palette-wrapper"}>
        <div className={"discourse-chip-palette"}>
          {Object.entries(filteredDiscourseToColorMap).map(([d, color]) => {
            let label = null;
            if (["Method", "Result"].includes(d)) {
              label = (
                <>
                  <IconButton
                    aria-label="decrease"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.props.handleDecreaseNumHighlights(d);
                    }}
                  >
                    <RemoveIcon fontSize="inherit" />
                  </IconButton>
                  <span className={"discourse-chip-label"}>{d}</span>
                  <IconButton
                    aria-label="increase"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.props.handleIncreaseNumHighlights(d);
                    }}
                  >
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </>
              );
            } else {
              label = <span className={"discourse-chip-label"}>{d}</span>;
            }
            return (
              <Chip
                className={classNames("discourse-chip", {
                  deselected: deselectedDiscourses.includes(d),
                })}
                label={label}
                key={d}
                onClick={() => this.props.handleDiscourseSelected(d)}
                style={{ backgroundColor: color }}
                variant="outlined"
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default DiscoursePalette;
