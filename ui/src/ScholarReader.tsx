import React from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./ScholarReader.scss";
import { Summaries } from "./semanticScholar";

interface ScholarReaderProps {
  pdfUrl: string | undefined;
  summaries: Summaries;
}

interface ScholarReaderState {
  numPages: number | null;
  pageNumber: number;
}

/*
 * Based on example code from the react-pdf project,
 * https://github.com/wojtekmaj/react-pdf
 * Sample code is under MIT license.
 */
class ScholarReader extends React.Component<ScholarReaderProps, ScholarReaderState> {
  constructor(props: ScholarReaderProps) {
    super(props);
    this.state = {
      numPages: null,
      pageNumber: 1
    };
  }

  onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(numPages);
    this.setState({ numPages });
  };

  render() {
    const { numPages } = this.state;

    return (
      <div className="ScholarReader">
        <div className="ScholarReader__container">
          <div className="ScholarReader__container__document"></div>
        </div>
      </div>
    );
  }
}

export default ScholarReader;
