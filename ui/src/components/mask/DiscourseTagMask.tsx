import React from "react";
import { DiscourseObj } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import DiscourseTag from "../discourse/DiscourseTag";
import HighlightMask from "./HighlightMask";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
  opacity: number;
}

/**
 * Declutter relevant sentences and add discourse tag in margin for each sentence.
 */
class DiscourseTagMask extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, discourseObjs, opacity } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const filterDiscourseObjs = discourseObjs
      .filter((d) => d.label !== "Author")
      .filter((d) => d.tagLocation.page === pageNumber);

    return (
      <>
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
        <HighlightMask
          pageView={pageView}
          discourseObjs={filterDiscourseObjs}
          opacity={opacity}
        />
      </>
    );
  }
}

export default DiscourseTagMask;
