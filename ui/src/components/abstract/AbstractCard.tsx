import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classNames from "classnames";
import React from "react";
import { isSentence, Sentence } from "../../api/types";
import * as selectors from "../../selectors";
import { Entities } from "../../state";
import { RichText } from "../common";

interface Props {
  entities: Entities;
  abstractIds: string[];
  selectedAbstractId: string;
  setSelectedAbstractId: (id: string) => void;
}

class AbstractCard extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { entities, abstractIds, selectedAbstractId } = this.props;
    const abstractSentences = abstractIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter((e) => isSentence(e))
      .map((e) => e as Sentence);

    return (
      <div className={"abstract-card-wrapper"}>
        <Accordion className={"abstract-card"} defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="abstract-card__header" variant={"h6"}>Abstract</Typography>
          </AccordionSummary>
          {abstractSentences.map((s, i) =>
            s.attributes.tex !== null ? (
              <div
                key={i}
                className={classNames("abstract-card-sentence", {
                  selected: selectedAbstractId === s.id,
                })}
                onClick={() => this.props.setSelectedAbstractId(s.id)}
              >
                <RichText>{selectors.cleanTex(s.attributes.tex!)}</RichText>
              </div>
            ) : null
          )}
        </Accordion>
      </div>
    );
  }
}

export default AbstractCard;
