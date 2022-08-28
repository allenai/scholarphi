import React from "react";
import { FacetedHighlight } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import FacetTag from "./FacetTag";

interface Props {
  pageView: PDFPageView;
  facetedHighlights: FacetedHighlight[];
}

class FacetLabelLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, facetedHighlights } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    return (
      <div className={"facet-tag-layer"}>
        {facetedHighlights
          .filter((d) => d.tagLocation.page === pageNumber)
          .map((d) => (
            <FacetTag
              pageView={pageView}
              anchor={d.tagLocation}
              content={<span>{d.label}</span>}
              color={d.color}
              entityId={d.id}
              key={d.id}
            />
          ))}
      </div>
    );
  }
}

export default FacetLabelLayer;
