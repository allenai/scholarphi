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

    console.log(
      discourseObjs.filter((x: DiscourseObj) => x.label === "Author")
    );

    return (
      <div className={"underline-layer"}>
        {discourseObjs
          .filter((x: DiscourseObj) => x.label === "Author")
          .map((x: DiscourseObj) => (
            <Annotation
              pageView={pageView}
              id={x.id}
              underline={true}
              selected={false}
              boundingBoxes={x.bboxes}
              handleSelect={() => {}}
            />
          ))}
      </div>
    );
  }
}

export default UnderlineLayer;
