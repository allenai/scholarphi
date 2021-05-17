import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classNames from "classnames";
import React from "react";
import { isSentence, Sentence } from "../../api/types";
import * as selectors from "../../selectors";
import { Entities } from "../../state";
import { LatexPreview } from "../common";

interface Props {
  entities: Entities;
  abstractIds: string[];
  abstractDiscourseClassification: { [id: string]: string | undefined };
  selectedAbstractId: string;
  setSelectedAbstractId: (id: string) => void;
}

class AbstractCard extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      entities,
      abstractIds,
      selectedAbstractId,
      abstractDiscourseClassification,
    } = this.props;
    const abstractSentences = abstractIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter((e) => isSentence(e))
      .map((e) => e as Sentence);

    const discourse2ColorMap: { [discourse: string]: string } = {
      Objective: "#9AC2C5",
      Background: "#C2C6A7",
      Method: "#ECCE8E",
      Result: "#270722",
    };
    const opacity = "4D";

    const abstractColors = abstractIds
      .map((id) => abstractDiscourseClassification[id])
      .filter((d) => d !== undefined)
      .map((d) => discourse2ColorMap[d!]);

    return (
      <div className={"abstract-card-wrapper"}>
        <Accordion className={"abstract-card"} defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="abstract-card__header" variant={"h6"}>
              Abstract
            </Typography>
          </AccordionSummary>
          <div className={"discourse-chip-palette"}>
            {Object.entries(discourse2ColorMap).map(([d, color]) => (
              <Chip
                className={"discourse-chip"}
                label={d}
                onClick={() => {}}
                style={{ backgroundColor: color + opacity }}
                variant="outlined"
              />
            ))}
          </div>
          {abstractSentences.map((s, i) =>
            s.attributes.tex !== null ? (
              <div
                key={i}
                className={classNames("abstract-card-sentence", {
                  selected: selectedAbstractId === s.id,
                })}
                style={{ position: "relative" }}
                onClick={() => this.props.setSelectedAbstractId(s.id)}
              >
                <div
                  className={classNames(
                    `discourse-tag ${abstractDiscourseClassification[s.id]}`
                  )}
                  style={{
                    backgroundColor: abstractColors[i] + opacity,
                  }}
                ></div>
                <LatexPreview>
                  {selectors.cleanTex(s.attributes.tex!)}
                </LatexPreview>
              </div>
            ) : null
          )}
        </Accordion>
      </div>
    );
  }
}

export default AbstractCard;
