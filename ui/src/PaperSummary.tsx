import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import SaveIcon from "@material-ui/icons/Bookmark";
import CiteIcon from "@material-ui/icons/FormatQuote";
import AuthorList from "./AuthorList";
import FeedbackButton from "./FeedbackButton";
import ChartIcon from "./icon/ChartIcon";
import InfluentialCitationIcon from "./icon/InfluentialCitationIcon";
import logger from "./logging";
import { userLibraryUrl } from "./s2-url";
import S2Link from "./S2Link";
import { PaperId, UserLibrary } from "./state";
import { Paper } from "./types/api";
import { truncateText } from "./utils/ui";

import React from "react";

interface Props {
  paper: Paper;
  userLibrary: UserLibrary | null;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  openedPaperId?: PaperId;
}

interface State {
  showFullAbstract: boolean;
  errorMessage: string;
}

function warnOfUnimplementedActionAndTrack(
  actionType: string,
  message?: string
) {
  const DEFAULT_MESSAGE =
    "Sorry, that feature isn't implemented yet. Clicking it tells us " +
    "you're interested in the feature, increasing the likelihood that " +
    "it'll be implemented!";
  alert(message || DEFAULT_MESSAGE);
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

export default class PaperSummary extends React.PureComponent<Props, State> {
  state = {
    showFullAbstract: false,
    errorMessage: "",
  };

  saveToLibrary = async (
    userLibrary: UserLibrary | null,
    addToLibrary: Function,
    s2Id: string,
    paperTitle: string
  ): Promise<void> => {
    if (!userLibrary) {
      warnOfUnimplementedActionAndTrack(
        "save"
        // "Before you can save papers to your library, you must be logged " +
        //   "into Semantic Scholar. Visit https://semanticscholar.org to log in. " +
        //   "Then refresh this page and try again."
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

  render(): React.ReactNode {
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
        </div>
        <div className="paper-summary__section">
          <p>
            {paper.authors.length > 0 && (
              <AuthorList showLinks authors={paper.authors} />
            )}
          </p>
        </div>
        <div className="paper-summary__section">
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
                <React.Fragment>
                  {truncatedAbstract}
                  <span
                    className="paper-summary__abstract__show-more-label"
                    onClick={() => {
                      this.setState({ showFullAbstract: true });
                    }}
                  >
                    (show more)
                  </span>
                </React.Fragment>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="paper-summary__metrics-and-actions paper-summary__section">
          {hasMetrics ? (
            <div className="paper-summary__metrics">
              {paper.influentialCitationCount !== undefined &&
              paper.influentialCitationCount > 0 ? (
                <Tooltip
                  placement="bottom-start"
                  title={
                    <React.Fragment>
                      <strong>
                        {paper.influentialCitationCount} influential citation
                        {paper.influentialCitationCount !== 1 ? "s" : ""}
                      </strong>
                    </React.Fragment>
                  }
                >
                  <div className="paper-summary__metrics__metric">
                    <InfluentialCitationIcon width="12" height="12" />
                    {paper.influentialCitationCount}
                  </div>
                </Tooltip>
              ) : null}
              {paper.citationVelocity !== undefined &&
              paper.citationVelocity > 0 ? (
                <Tooltip
                  placement="bottom-start"
                  title={
                    <React.Fragment>
                      <strong>
                        Averaging {paper.citationVelocity} citation
                        {paper.citationVelocity !== 1 ? "s " : " "}
                        per year
                      </strong>
                    </React.Fragment>
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
            onClick={() => {
              warnOfUnimplementedActionAndTrack("cite");
              logger.log("debug", "citation-action", {
                type: "cite",
                paper: this.props.paper,
              });
            }}
          >
            Cite
          </Button>
          {inLibrary
            ? <LibraryButton label="In Your Library" onClick={() => goToLibrary()}/>
            : <LibraryButton label="Save To Library" onClick={() => {
              this.saveToLibrary(
                userLibrary,
                handleAddPaperToLibrary,
                paper.s2Id,
                paper.title
              );
              logger.log("debug", "citation-action", {
                type: "save-to-library",
                paper: this.props.paper,
              });
            }}/>
            }
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

const LibraryButton = (props: { label: string, onClick: () => void }): React.ReactElement => {
  const { label, onClick } = props;
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
