import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import SaveIcon from "@material-ui/icons/Bookmark";
import CiteIcon from "@material-ui/icons/FormatQuote";
import React from "react";
import AuthorList from "./AuthorList";
import FeedbackButton from "./FeedbackButton";
import ChartIcon from "./icon/ChartIcon";
import InfluentialCitationIcon from "./icon/InfluentialCitationIcon";
import { userLibraryUrl } from "./s2-url";
import S2Link from "./S2Link";
import { PaperId } from "./state";
import { Paper, UserLibrary } from "./types/api";
import { truncateText } from "./ui-utils";

function warnOfUnimplementedActionAndTrack(
  actionType: string,
  message?: string
) {
  const DEFAULT_MESSAGE =
    "Sorry, that feature isn't implemented yet. Clicking it tells us " +
    "you're interested in the feature, increasing the likelihood that " +
    "it'll be implemented!";
  message = message || DEFAULT_MESSAGE;
  alert(message);
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
  paper: Paper;
  userLibrary: UserLibrary | null;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  openedPaperId?: PaperId;
}

interface PaperSummaryState {
  showFullAbstract: boolean;
  errorMessage: string;
}

export class PaperSummary extends React.PureComponent<
  PaperSummaryProps,
  PaperSummaryState
> {
  constructor(props: PaperSummaryProps) {
    super(props);

    this.state = {
      showFullAbstract: false,
      errorMessage: "",
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
    s2Id: string,
    paperTitle: string
  ) {
    if (!userLibrary) {
      warnOfUnimplementedActionAndTrack(
        "save",
        "Before you can save papers to your library, you must be logged " +
          "into Semantic Scholar. Visit https://semanticscholar.org to log in. " +
          "Then refresh this page and try again."
      );
    } else {
      try {
        await addToLibrary(s2Id, paperTitle);
        trackLibrarySave();
        this.setState({
          errorMessage: "",
        });
      } catch (error) {
        this.setState({
          errorMessage: "Cannot save to library at this time.",
        });
      }
    }
  }

  render() {
    const { paper, userLibrary, handleAddPaperToLibrary } = this.props;

    const hasMetrics =
      paper.citationVelocity !== 0 || paper.influentialCitationCount !== 0;
    const truncatedAbstract = paper.abstract
      ? truncateText(paper.abstract, 300)
      : null;
    const inLibrary = userLibrary
      ? userLibrary.paperIds.includes(paper.s2Id)
      : false;

    return (
      <div className="paper-summary">
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
        <div className="paper-summary__metrics-and-actions paper-summary__section">
          {hasMetrics ? (
            <div className="paper-summary__metrics">
              {paper.influentialCitationCount > 0 ? (
                <Tooltip
                  placement="bottom-start"
                  title={
                    <>
                      <strong>
                        {paper.influentialCitationCount} influential citation
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
            ? this.renderLibraryButton("In Your Library", () => goToLibrary())
            : this.renderLibraryButton("Save To Library", () =>
                this.saveToLibrary(
                  userLibrary,
                  handleAddPaperToLibrary,
                  paper.s2Id,
                  paper.title
                )
              )}
        </div>

        <div className="paper-summary__section paper-summary__feedback">
          Does something look wrong? Give us feedback.
          <FeedbackButton
            paperId={this.props.openedPaperId}
            extraContext={{ paperId: paper.s2Id }}
          />
        </div>

        <div className="paper-summary__library-error">
          {this.state.errorMessage && this.state.errorMessage}
        </div>
      </div>
    );
  }
}

export default PaperSummary;
