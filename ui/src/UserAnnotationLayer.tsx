import React from "react";
import { Point } from "./Selection";
import SelectionCanvas from "./SelectionCanvas";
import { ScholarReaderContext } from "./state";
import { AnnotationData, UserAnnotationType } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import UserAnnotation from "./UserAnnotation";

interface UserAnnotationLayerProps {
  pageNumber: number;
  /**
   * The PDFPageView this annotation layer will be added on top of. The pageView is needed for
   * transforming annotation bounding boxes into render locations in the page 'div'.
   */
  pageView: PDFPageView;
}

export class UserAnnotationLayer extends React.PureComponent<
  UserAnnotationLayerProps
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  onSelectionMade(anchor: Point, active: Point) {
    const { addUserAnnotation, userAnnotationType } = this.context;
    addUserAnnotation(
      selectionToAnnotation(
        this.props.pageView,
        anchor,
        active,
        userAnnotationType
      )
    );
  }

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ userAnnotations, userAnnotationType }) => (
          <>
            <SelectionCanvas
              key="selection-canvas"
              onSelection={this.onSelectionMade.bind(this)}
            />
            {userAnnotations
              .filter(a => a.boundingBox.page === this.props.pageNumber - 1)
              .map(a => (
                <UserAnnotation
                  key={`user-annotation-${a.id}`}
                  annotation={a}
                  inactive={a.type !== userAnnotationType}
                />
              ))}
          </>
        )}
      </ScholarReaderContext.Consumer>
    );
  }
}

function selectionToAnnotation(
  pageView: PDFPageView,
  anchor: Point,
  active: Point,
  type?: UserAnnotationType
): AnnotationData {
  const viewport = pageView.viewport;
  const [anchorPdfX, anchorPdfY] = [
    anchor.x / viewport.width,
    anchor.y / viewport.height
  ];
  const [activePdfX, activePdfY] = [
    active.x / viewport.width,
    active.y / viewport.height
  ];

  const page = pageView.pdfPage.pageNumber - 1;
  const left = Math.min(anchorPdfX, activePdfX);
  const top = Math.min(anchorPdfY, activePdfY);
  const width = Math.abs(activePdfX - anchorPdfX);
  const height = Math.abs(activePdfY - anchorPdfY);

  return {
    type: type || "citation",
    page,
    left,
    top,
    width,
    height
  };
}

export default UserAnnotationLayer;
