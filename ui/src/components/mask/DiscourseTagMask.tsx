import React from "react";
import {
  BoundingBox,
  Entity,
  isCitation,
  isSentence,
  SkimmingAnnotation,
} from "../../api/types";
import { Entities } from "../../state";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import { DiscourseTag } from "../discourse/DiscourseTag";
import HighlightMask from "./HighlightMask";
import PageMask from "./PageMask";

interface Props {
  pageView: PDFPageView;
  entities: Entities;
  skimmingData: SkimmingAnnotation;
  showLead: boolean;
  opacity: number;
  discourseTags: object;
  discourseToColorMap: { [discourse: string]: string };
  deselectedDiscourses: string[];
  cuingStrategy: string;
}

export interface DiscourseObj {
  color: string;
  discourse: string;
  entity: Entity;
  id: string;
  tagLocation: BoundingBox;
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

  getFilteredBoundingBoxes = (
    ids: string[],
    entities: Entities,
    pageNumber: number
  ) => {
    return ids
      .map((id) => entities.byId[id])
      .filter((e) => isSentence(e))
      .filter((e) => e.attributes.bounding_boxes.length !== 0)
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
  };

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
      cuingStrategy,
      showLead,
      opacity,
      discourseTags,
      discourseToColorMap,
      deselectedDiscourses,
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

    ids = ids.concat(Object.keys(discourseTags));

    let discourseObjs = Object.entries(discourseTags)
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

    const deselectedIds = discourseObjs
      .filter((e) => deselectedDiscourses.includes(e.discourse))
      .map((x) => x.id);

    discourseObjs = discourseObjs.filter((e) => !deselectedIds.includes(e.id));

    const showBoxes = ids
      .filter((id) => !deselectedIds.includes(id))
      .map((id) => sentences[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber)
      .concat(skimmingData.manualBoxes);

    return (
      <>
        {discourseObjs
          .filter((d) => d.discourse !== "Highlight")
          .map((d, i) => (
            <DiscourseTag
              pageView={pageView}
              anchor={d.tagLocation}
              content={<span>{d.discourse}</span>}
              color={d.color}
              entityId={d.id}
              onMouseOver={this.onTagMouseOver}
              onMouseOut={this.onTagMouseOut}
              key={i}
            />
          ))}
        {cuingStrategy === "declutter" && (
          <PageMask
            pageView={pageView}
            show={showBoxes}
            noShow={noShowBoxes}
            opacity={opacity}
            highlight={this.state.highlight}
          />
        )}
        {cuingStrategy === "highlight" && (
          <HighlightMask pageView={pageView} discourseObjs={discourseObjs} />
        )}
      </>
    );
  }
}

export default DiscourseTagMask;
