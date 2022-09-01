import React from "react";
import { Section } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import Marker from "./Marker";

interface Props {
  pageView: PDFPageView;
  sections: Section[];
  handleMarkerClicked: (section: string, active: boolean) => void;
}

class MarkerLayer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, sections } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    return (
      <div className={"marker-layer"}>
        {sections
          .filter((section) => section.box.page === pageNumber)
          .map((section) => (
            <Marker
              key={section.section}
              id={section.section}
              pageView={pageView}
              anchor={section.box}
              handleMarkerClicked={this.props.handleMarkerClicked}
            />
          ))}
      </div>
    );
  }
}

export default MarkerLayer;
