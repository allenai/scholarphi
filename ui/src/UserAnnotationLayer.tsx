import React from "react";
import { Point } from "./Selection";
import SelectionCanvas from "./SelectionCanvas";
import { Annotation, AnnotationData, UserAnnotationType } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import UserAnnotation from "./UserAnnotation";

interface Props {
  pageNumber: number;
  /**
   * The PDFPageView this annotation layer will be added on top of. The pageView is needed for
   * transforming annotation bounding boxes into render locations in the page 'div'.
   */
  pageView: PDFPageView;
  annotations: Annotation[];
  annotationType: UserAnnotationType;
  selectedAnnotationId: string | null;
  selectedAnnotationSpanId: string | null;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
  handleAddAnnotation: (data: AnnotationData) => void;
  handleUpdateAnnotation: (id: string, annotation: Annotation) => void;
  handleDeleteAnnotation: (id: string) => void;
}

export class UserAnnotationLayer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onSelectionMade = this.onSelectionMade.bind(this);
  }

  onSelectionMade(anchor: Point, active: Point) {
    const { handleAddAnnotation, annotationType } = this.props;
    handleAddAnnotation(
      createAnnotationFromSelection(
        this.props.pageView,
        anchor,
        active,
        annotationType
      )
    );
  }

  render() {
    const {
      pageNumber,
      pageView,
      annotationType,
      selectedAnnotationId,
      selectedAnnotationSpanId,
      handleUpdateAnnotation,
      handleDeleteAnnotation,
      handleSelectAnnotation,
      handleSelectAnnotationSpan,
    } = this.props;

    return (
      <>
        <SelectionCanvas
          key="selection-canvas"
          onSelection={this.onSelectionMade}
        />
        {this.props.annotations
          .filter((a) => a.boundingBox.page === pageNumber - 1)
          .map((a) => {
            const annotationId = `user-annotation-${a.id}`;
            const isSelected = annotationId === selectedAnnotationId;
            return (
              <UserAnnotation
                pageView={pageView}
                key={annotationId}
                annotation={a}
                active={a.type === annotationType}
                selected={isSelected}
                selectedSpanId={isSelected ? selectedAnnotationSpanId : null}
                handleUpdateAnnotation={handleUpdateAnnotation}
                handleDeleteAnnotation={handleDeleteAnnotation}
                handleSelectAnnotation={handleSelectAnnotation}
                handleSelectAnnotationSpan={handleSelectAnnotationSpan}
              />
            );
          })}
      </>
    );
  }
}

function createAnnotationFromSelection(
  pageView: PDFPageView,
  anchor: Point,
  active: Point,
  type?: UserAnnotationType
): AnnotationData {
  const viewport = pageView.viewport;
  const [anchorPdfX, anchorPdfY] = [
    anchor.x / viewport.width,
    anchor.y / viewport.height,
  ];
  const [activePdfX, activePdfY] = [
    active.x / viewport.width,
    active.y / viewport.height,
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
    height,
  };
}

export default UserAnnotationLayer;
