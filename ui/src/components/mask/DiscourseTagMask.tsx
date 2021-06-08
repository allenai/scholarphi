import React from "react";
import {
  BoundingBox,
  isCitation,
  isSentence,
  SkimmingAnnotation,
} from "../../api/types";
import { Entities } from "../../state";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import { DiscourseTag } from "../common";
import PageMask from "./PageMask";

interface Props {
  pageView: PDFPageView;
  entities: Entities;
  skimmingData: SkimmingAnnotation;
  showLead: boolean;
}

interface State {
  highlight: BoundingBox[];
}

/**
 * Declutter relevant sentences and add discourse tag in margin for each sentence.
 */
class DiscourseTagMask extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { highlight: [] };
  }

  onTagMouseOver = (entityId: string) => {
    this.setState({
      highlight: this.props.entities.byId[entityId].attributes.bounding_boxes,
    });
  };

  onTagMouseOut = () => {
    this.setState({ highlight: [] });
  };

  render() {
    const { pageView, entities, skimmingData, showLead } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const sentences = Object.fromEntries(
      Object.entries(entities.byId).filter(
        ([id, e], _) =>
          isSentence(e) && e.attributes.bounding_boxes.length !== 0
      )
    );

    const discourse2ColorMap: { [discourse: string]: string } = {
      Motivation: "#9AC2C5",
      Contribution: "#C2C6A7",
      Method: "#ECCE8E",
      Experiment: "#75BCE5",
      Result: "#F285A0",
      FutureWork: "#EDD96D",
    };

    const citationBoxes = Object.values(entities.byId)
      .filter((e) => isCitation(e) && e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
    const noShowBoxes = skimmingData.noShow
      .map((id) => sentences[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber)
      .concat(citationBoxes);

    let showBoxes: BoundingBox[] = [];
    let ids = [
      ...skimmingData.goldSummary,
      ...skimmingData.metadata,
      ...skimmingData.abstract,
      ...skimmingData.conclusion,
      ...skimmingData.sectionHeaders,
      ...skimmingData.subsectionHeaders,
    ];
    if (showLead) {
      ids = ids.concat(skimmingData.firstSentences);
    }
    showBoxes = ids
      .map((id) => sentences[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
    showBoxes = showBoxes.concat(skimmingData.manualBoxes);

    const discourseObjs = Object.entries(skimmingData.discourseTags)
      .map(([id, discourse]) => ({
        id: id,
        entity: sentences[id],
        discourse: discourse as string,
      }))
      .map((e) => ({
        ...e,
        tagLocation:
          e.entity.attributes.bounding_boxes[
            e.entity.attributes.bounding_boxes.length - 1
          ],
        color: discourse2ColorMap[e.discourse],
      }))
      .filter((e) => e.tagLocation.page === pageNumber);

    return (
      <>
        {discourseObjs.map((d, i) => (
          <DiscourseTag
            pageView={this.props.pageView}
            anchor={d.tagLocation}
            content={<span>{d.discourse}</span>}
            color={d.color}
            entityId={d.id}
            onMouseOver={this.onTagMouseOver}
            onMouseOut={this.onTagMouseOut}
            key={i}
          />
        ))}
        <PageMask
          pageView={pageView}
          show={showBoxes}
          noShow={noShowBoxes}
          opacity={0.4}
          highlight={this.state.highlight}
        />
      </>
    );
  }
}

export default DiscourseTagMask;
