import Accordion from "@material-ui/core/Accordion";
import Chip from "@material-ui/core/Chip";
import classNames from "classnames";
import React from "react";

interface Props {
  discourseToColorMap: { [discourse: string]: string };
  deselectedDiscourses: string[];
  handleClickDiscourseChip: (discourse: string) => void;
}

class DiscoursePalette extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { discourseToColorMap, deselectedDiscourses } = this.props;

    return (
      <div className={"discourse-palette-wrapper"}>
        <Accordion className={"discourse-palette"} defaultExpanded={true}>
          <div className={"discourse-chip-palette"}>
            {Object.entries(discourseToColorMap).map(([d, color]) => (
              <Chip
                className={classNames("discourse-chip", {
                  deselected: deselectedDiscourses.includes(d),
                })}
                label={<span className={"discourse-chip-label"}>{d}</span>}
                key={d}
                onClick={() => this.props.handleClickDiscourseChip(d)}
                style={{ backgroundColor: color }}
                variant="outlined"
              />
            ))}
          </div>
        </Accordion>
      </div>
    );
  }
}

export default DiscoursePalette;
