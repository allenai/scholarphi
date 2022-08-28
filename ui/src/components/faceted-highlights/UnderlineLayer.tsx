import React from "react";
import { FacetedHighlight } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import Annotation from "../entity/Annotation";

interface Props {
  pageView: PDFPageView;
  facetedHighlights: FacetedHighlight[];
}

class UnderlineLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, facetedHighlights } = this.props;

    return (
      <div className={"underline-layer"}>
        {facetedHighlights.map((x: FacetedHighlight) => (
          <Annotation
            pageView={pageView}
            key={x.id}
            id={x.id}
            className={"facet-underline"}
            underline={true}
            active={false}
            selected={false}
            color={x.color}
            boundingBoxes={x.boxes}
            handleSelect={() => {}}
          />
        ))}
      </div>
    );
  }
}

export default UnderlineLayer;
