import React from "react";
import { DiscourseObj } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import DiscourseTag from "../discourse/DiscourseTag";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
}

class DiscourseTagLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, discourseObjs } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const filterDiscourseObjs = discourseObjs.filter(
      (d) => d.tagLocation.page === pageNumber
    );

    return (
      <div className={"discourse-tag-layer"}>
        {filterDiscourseObjs.map((d) => (
          <DiscourseTag
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

export default DiscourseTagLayer;
