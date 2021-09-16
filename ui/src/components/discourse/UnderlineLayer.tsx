import React from "react";
import { DiscourseObj } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import Annotation from "../entity/Annotation";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
}

class UnderlineLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, discourseObjs } = this.props;

    return (
      <div className={"underline-layer"}>
        {discourseObjs.map((x: DiscourseObj) => (
          <Annotation
            pageView={pageView}
            key={x.id}
            id={x.id}
            className={"discourse-underline"}
            underline={true}
            active={false}
            selected={false}
            color={x.color}
            boundingBoxes={x.bboxes}
            handleSelect={() => {}}
          />
        ))}
      </div>
    );
  }
}

export default UnderlineLayer;
