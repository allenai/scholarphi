import React from 'react'
import { Document, Page } from 'react-pdf/dist/entry.webpack'

interface ScholarReaderProps {
  pdfUrl: string | undefined
}

interface ScholarReaderState {
  numPages: number | null,
  pageNumber: number
}

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
    const { pageNumber, numPages } = this.state

    return (
      <div>
        <Document
          file={this.props.pdfUrl}
          onLoadSuccess={this.onDocumentLoadSuccess.bind(this)}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        <p>Page {pageNumber} of {numPages}</p>
      </div>
    );
  }
}

export default ScholarReader
