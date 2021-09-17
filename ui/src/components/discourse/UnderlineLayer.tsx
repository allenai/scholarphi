import React from "react";
import { DiscourseObj, SentenceUnit } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import Annotation from "../entity/Annotation";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
  leadSentences: SentenceUnit[];
}

class UnderlineLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, discourseObjs, leadSentences } = this.props;

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
        {leadSentences.map((x: SentenceUnit, index: number) => (
          <Annotation
            pageView={pageView}
            key={index.toString()}
            id={index.toString()}
            className={"discourse-underline"}
            underline={true}
            active={false}
            selected={false}
            color={"#b3b300"}
            boundingBoxes={x.bboxes}
            handleSelect={() => {}}
          />
        ))}
      </div>
    );
  }
}

export default UnderlineLayer;
