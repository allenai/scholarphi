import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import SaveIcon from "@material-ui/icons/Bookmark";
import CiteIcon from "@material-ui/icons/FormatQuote";
import React from "react";
import AuthorList from "./AuthorList";
import ChartIcon from "./icon/ChartIcon";
import InfluentialCitationIcon from "./icon/InfluentialCitationIcon";
import { userLibraryUrl } from "./s2-url";
import S2Link from "./S2Link";
import { ScholarReaderContext } from "./state";
import { UserLibrary } from "./types/api";
import { truncateText } from "./ui-utils";

function warnOfUnimplementedActionAndTrack(actionType: string) {
  alert(
    "Sorry, that feature isn't implemented yet. Clicking it tells us " +
      "you're interested in the feature, increasing the likelihood that " +
      "it'll be implemented!"
  );
  if (window.heap) {
    window.heap.track("Click on Unimplemented Action", { actionType });
  }
}

function goToLibrary() {
  window.open(userLibraryUrl, "_blank");
}

function trackLibrarySave() {
  if (window.heap) {
    window.heap.track("Save to Library", { actionType: "save" });
  }
}

interface PaperSummaryProps {
  paperId: string;
}

interface PaperSummaryState {
  showFullAbstract: boolean;
  errorMessage: string;
}

export class PaperSummary extends React.PureComponent<
  PaperSummaryProps,
  PaperSummaryState
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  constructor(props: PaperSummaryProps) {
    super(props);

    this.state = {
      showFullAbstract: false,
      errorMessage: ""
    };
  }

  renderLibraryButton(label: string, onClick: () => void) {
    return (
      <Button
        startIcon={<SaveIcon />}
        className="paper-summary__action"
        onClick={onClick}
      >
        {label}
      </Button>
    );
  }

  async saveToLibrary(
    userLibrary: UserLibrary | null,
    addToLibrary: Function,
    paperTitle: string
  ) {
    if (!userLibrary) {
      warnOfUnimplementedActionAndTrack("save");
    } else {
      try {
        await addToLibrary(this.props.paperId, paperTitle);
        trackLibrarySave();
        this.setState({
          errorMessage: ""
        });
      } catch (error) {
        this.setState({
          errorMessage: "Cannot save to library at this time."
        });
      }
    }
  }

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({
          papers,
          paperJumpRequest,
          requestJumpToPaper,
          userLibrary,
          addToLibrary
        }) => {
          if (papers === null || papers[this.props.paperId] === undefined) {
            return null;
          }

          const paper = papers[this.props.paperId];
          const hasMetrics =
            paper.citationVelocity !== 0 ||
            paper.influentialCitationCount !== 0;
          const truncatedAbstract = paper.abstract
            ? truncateText(paper.abstract, 300)
            : null;
          const inLibrary = userLibrary
            ? userLibrary.paperIds.includes(this.props.paperId)
            : false;

          return (
            <div
              ref={ref => {
                /*
                 * Jump to paper in paper list when requested.
                 */
                if (paperJumpRequest === this.props.paperId) {
                  if (ref !== null) {
                    ref.scrollIntoView();
                  }
                  /*
                   * Set request to null to report that the jump has completed.
                   */
                  requestJumpToPaper(null);
                }
              }}
              className="paper-summary"
            >
              {/* Paper details */}
              <div className="paper-summary__section">
                <p className="paper-summary__title">
                  <S2Link url={paper.url}>{paper.title}</S2Link>
                </p>
                <p>
                  {paper.authors.length > 0 && (
                    <AuthorList showLinks authors={paper.authors} />
                  )}
                </p>
                {paper.year !== null && (
                  <p className="paper-summary__year">{paper.year}</p>
                )}
              </div>
              {paper.abstract !== null && (
                <div className="paper-summary__section">
                  <p className="paper-summary__abstract">
                    {this.state.showFullAbstract ||
                    truncatedAbstract === paper.abstract ? (
                      paper.abstract
                    ) : (
                      <>
                        {truncatedAbstract}
                        <span
                          className="paper-summary__abstract__show-more-label"
                          onClick={() => {
                            this.setState({ showFullAbstract: true });
                          }}
                        >
                          (show more)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="paper-summary__metrics-and-actions">
                {hasMetrics ? (
                  <div className="paper-summary__metrics">
                    {paper.influentialCitationCount > 0 ? (
                      <Tooltip
                        placement="bottom-start"
                        title={
                          <>
                            <strong>
                              {paper.influentialCitationCount} influential
                              citation
                              {paper.influentialCitationCount !== 1 ? "s" : ""}
                            </strong>
                          </>
                        }
                      >
                        <div className="paper-summary__metrics__metric">
                          <InfluentialCitationIcon width="12" height="12" />
                          {paper.influentialCitationCount}
                        </div>
                      </Tooltip>
                    ) : null}
                    {paper.citationVelocity > 0 ? (
                      <Tooltip
                        placement="bottom-start"
                        title={
                          <>
                            <strong>
                              Averaging {paper.citationVelocity} citation
                              {paper.citationVelocity !== 1 ? "s " : " "}
                              per year
                            </strong>
                          </>
                        }
                      >
                        <div className="paper-summary__metrics__metric">
                          <ChartIcon width="15" height="15" />
                          {paper.citationVelocity}
                        </div>
                      </Tooltip>
                    ) : null}
                  </div>
                ) : null}
                <Button
                  startIcon={<CiteIcon />}
                  className="paper-summary__action"
                  onClick={() => warnOfUnimplementedActionAndTrack("cite")}
                >
                  Cite
                </Button>
                {inLibrary
                  ? this.renderLibraryButton("In Your Library", () =>
                      goToLibrary()
                    )
                  : this.renderLibraryButton("Save To Library", () =>
                      this.saveToLibrary(userLibrary, addToLibrary, paper.title)
                    )}
              </div>
              <div className="paper-summary__library-error">
                {this.state.errorMessage && this.state.errorMessage}
              </div>
            </div>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default PaperSummary;
