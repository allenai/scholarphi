import React, { Component } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';


class MyApp extends Component {
  state = {
    numPages: null,
    pageNumber: 1,
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }

  render() {
    const { pageNumber, numPages } = this.state;

    /* `this` fix from https://github.com/wojtekmaj/react-pdf/issues/52#issuecomment-325688092 */
    return (
      <div>
        <Document
          file="https://arxiv.org/pdf/1505.05425.pdf"
          onLoadSuccess={this.onDocumentLoadSuccess.bind(this)}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        <p>Page {pageNumber} of {numPages}</p>
      </div>
    );
  }
}

export default MyApp;
