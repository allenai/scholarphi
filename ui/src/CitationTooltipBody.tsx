import Button from "@material-ui/core/Button";
import MobileStepper from "@material-ui/core/MobileStepper";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import React from "react";
import PaperSummary from "./PaperSummary";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";

interface CitationTooltipBodyProps {
  paperIds: string[];
}

interface CitationTooltipBodyState {
  activeCitation: number;
}

export class CitationTooltipBody extends React.Component<
  CitationTooltipBodyProps,
  CitationTooltipBodyState
> {
  constructor(props: CitationTooltipBodyProps) {
    super(props);
    this.state = {
      activeCitation: 0
    };
  }

  render() {
    return (
      <div className="citation-tooltip-body">
        {this.props.paperIds.map((paperId, i) => (
          <div
            className="citation-tooltip-body__paper-summary-container"
            key={paperId}
            hidden={i !== this.state.activeCitation}
          >
            <PaperSummary key={paperId} paperId={paperId} />
          </div>
        ))}
        <ScholarReaderContext.Consumer>
          {({ papers }) => (
            <div className="citation-tooltip-body__stepper-container">
              <MobileStepper
                hidden={selectors.countOfCitationsWithSummaries(papers, this.props.paperIds) <= 1}
                variant="dots"
                steps={this.props.paperIds.length}
                position="static"
                activeStep={this.state.activeCitation}
                nextButton={
                  <Button
                    size="small"
                    onClick={() => this.setState({ activeCitation: this.state.activeCitation + 1 })}
                    disabled={this.state.activeCitation === this.props.paperIds.length - 1}
                  >
                    Next <KeyboardArrowRight />
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={() => this.setState({ activeCitation: this.state.activeCitation - 1 })}
                    disabled={this.state.activeCitation === 0}
                  >
                    <KeyboardArrowLeft />
                    Back
                  </Button>
                }
              />
            </div>
          )}
        </ScholarReaderContext.Consumer>
      </div>
    );
  }
}

export default CitationTooltipBody;
