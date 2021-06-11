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
import { DiscourseTag } from "../discourse/DiscourseTag";
import PageMask from "./PageMask";

interface Props {
  pageView: PDFPageView;
  entities: Entities;
  skimmingData: SkimmingAnnotation;
  showLead: boolean;
  opacity: number;
  customDiscourseTags: object;
  discourseToColorMap: { [discourse: string]: string };
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
    const {
      pageView,
      entities,
      skimmingData,
      showLead,
      opacity,
      customDiscourseTags,
      discourseToColorMap,
    } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const sentences = Object.fromEntries(
      Object.entries(entities.byId).filter(
        ([id, e], _) =>
          isSentence(e) && e.attributes.bounding_boxes.length !== 0
      )
    );

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

    ids = ids.concat(Object.keys(customDiscourseTags));

    const showBoxes = ids
      .map((id) => sentences[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber)
      .concat(skimmingData.manualBoxes);

    const discourseObjs = Object.entries({
      ...skimmingData.discourseTags,
      ...customDiscourseTags,
    })
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
        color: discourseToColorMap[e.discourse],
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
          opacity={opacity}
          highlight={this.state.highlight}
        />
      </>
    );
  }
}

export default DiscourseTagMask;
