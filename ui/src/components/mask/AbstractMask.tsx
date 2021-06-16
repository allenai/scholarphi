import classNames from "classnames";
import React from "react";
import { SkimmingAnnotation } from "../../api/types";
import { Entities } from "../../state";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import PageMask from "./PageMask";

interface Props {
  pageView: PDFPageView;
  entities: Entities;
  skimmingData: SkimmingAnnotation;
  abstractIds: string[];
  abstractDiscourseClassification: { [id: string]: string | undefined };
  selectedEntityIds: string[];
  selectedAbstractSentenceId: string;
  setSelectedAbstractSentenceId: (id: string) => void;
}

/**
 * Hides everything on a page that is not one of the selected entities.
 */
class AbstractMask extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      pageView,
      entities,
      skimmingData,
      abstractIds,
      selectedEntityIds,
      selectedAbstractSentenceId,
    } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);
    const { width, height } = uiUtils.getPageViewDimensions(pageView);

    const abstractBoundingBoxes = abstractIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .filter(([b]) => b.page === pageNumber);

    const showIds = [
      // ...skimmingData.metadata,
      ...skimmingData.sectionHeaders,
      ...skimmingData.subsectionHeaders,
    ];
    const boundingBoxes = selectedEntityIds
      .concat(selectedAbstractSentenceId)
      .concat(showIds)
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);

    return (
      <>
        <svg className="abstract-mask" width={width} height={height}>
          {selectedAbstractSentenceId !== "" ? (
            <PageMask pageView={pageView} show={boundingBoxes} />
          ) : null}
          {abstractBoundingBoxes.map((boxes, sentIndex) => {
            return boxes.map((b, i) => (
              <rect
                className={classNames(
                  "abstract-span",
                  `abstract-sent-${sentIndex}`,
                  {
                    selected:
                      abstractIds[sentIndex] === selectedAbstractSentenceId,
                  }
                )}
                key={`sent-${i}-mask`}
                x={b.left * width}
                y={b.top * height}
                width={b.width * width}
                height={b.height * height}
                opacity={0.05}
                fill={
                  abstractIds[sentIndex] === selectedAbstractSentenceId
                    ? "black"
                    : "white"
                }
                onClick={() =>
                  this.props.setSelectedAbstractSentenceId(
                    abstractIds[sentIndex]
                  )
                }
              />
            ));
          })}
          {this.props.children}
        </svg>
      </>
    );
  }
}

export default AbstractMask;
