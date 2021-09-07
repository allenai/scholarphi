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

    return (
      <>
        {discourseObjs
          .filter((e) => e.tagLocation.page === pageNumber)
          .map((d) => (
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
          discourseObjs={discourseObjs.filter(
            (e) => e.tagLocation.page === pageNumber
          )}
          opacity={opacity}
        />
      </>
    );
  }
}

export default DiscourseTagMask;
