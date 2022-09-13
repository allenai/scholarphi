import React from "react";
import { ScimSentence } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  pageView: PDFPageView;
  sentences: ScimSentence[];
}

class SentenceAnnotationLayer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, sentences } = this.props;

    const pageNumber = uiUtils.getPageNumber(pageView);
    const { width, height } = uiUtils.getPageViewDimensions(pageView);

    return (
      <div className="sentence-annotation-layer">
        {sentences &&
          sentences.map((sent, i) =>
            sent.boxes
              .filter((b) => b.page === pageNumber)
              .map((b, j) => {
                const highlightVerticalOffset = 4;
                const highlightLeftOffset = 4;
                return (
                  <div
                    key={`sentence-${i}-box-${j}`}
                    onMouseOver={() => console.log(`hoving over ${sent.text}`)}
                    style={{
                      position: "absolute",
                      pointerEvents: "auto",
                      left: b.left * width - highlightLeftOffset,
                      top: b.top * height - highlightVerticalOffset,
                      width: b.width * width + highlightLeftOffset,
                      height: b.height * height * 1.2,
                    }}
                  />
                );
              })
          )}
      </div>
    );
  }
}

export default SentenceAnnotationLayer;
