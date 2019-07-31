import React from 'react'
import { Document, Page } from 'react-pdf/dist/entry.webpack'

import './ScholarReader.scss'

interface ScholarReaderProps {
  pdfUrl: string | undefined
}

interface ScholarReaderState {
  numPages: number | null,
  pageNumber: number
}

/*
 * Based on example code from the react-pdf project,
 * https://github.com/wojtekmaj/react-pdf
 * Sample code is under MIT license.
 */
class ScholarReader extends React.Component<ScholarReaderProps, ScholarReaderState> {

  constructor(props: ScholarReaderProps) {
    super(props)
    this.state = {
      numPages: null,
      pageNumber: 1
    }
  }

  onDocumentLoadSuccess = ({ numPages } : { numPages: number }) => {
    console.log(numPages)
    this.setState({ numPages })
  }

  render() {
    const { numPages } = this.state

    return (
      <div className="ScholarReader">
        <div className="ScholarReader__container">
          <div className="ScholarReader__container__document">
            <Document
              file={this.props.pdfUrl}
              onLoadSuccess={this.onDocumentLoadSuccess.bind(this)}
            >
              {
                Array.from(
                  new Array(numPages),
                  (_, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      onLoadSuccess={() => removeTextLayerOffset()}
                    />
                  )
                )
              }
            </Document>
          </div>
        </div>
      </div>
    );
  }
}

/*
 * Fix alignment of text layer with PDF layer. Fix from react-pdf GitHub issue:
 * https://github.com/wojtekmaj/react-pdf/issues/332#issuecomment-458121654
 */
function removeTextLayerOffset() {
  const textLayers = document.querySelectorAll(".react-pdf__Page__textContent");
    textLayers.forEach(layer => {
      if (layer instanceof HTMLElement) {
        const { style } = layer;
        style.top = "0";
        style.left = "0";
        style.transform = "";
      }
  });
}

export default ScholarReader
