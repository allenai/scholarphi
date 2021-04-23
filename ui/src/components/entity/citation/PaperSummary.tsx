import AuthorList from "./AuthorList";
import ExternalLink from "../../common/ExternalLink";
import FeedbackButton from "./FeedbackButton";
import {
  ChartIcon,
  InfluentialCitationIcon,
  InboundCitationIcon,
  OutboundCitationIcon,
} from "../../icon";
import S2Link from "./S2Link";
import { PaperId } from "../../../state";
import { Paper } from "../../../api/types";
import PaperAbstract from "./PaperAbstract";

import Tooltip from "@material-ui/core/Tooltip";
import React from "react";

interface Props {
  paper: Paper;
  openedPaperId?: PaperId;
}

export default class PaperSummary extends React.PureComponent<Props> {
  render(): React.ReactNode {
    const { paper } = this.props;

    const hasMetrics =
      paper.citationVelocity ||
      paper.influentialCitationCount ||
      paper.inboundCitations ||
      paper.outboundCitations;

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
            <PaperAbstract paper={paper} />
          </div>
        )}

        {/* Actions */}
        <div className="paper-summary__metrics-and-actions paper-summary__section">
          {hasMetrics ? (
            <div className="paper-summary__metrics">
              {!!paper.influentialCitationCount ? (
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
              {!!paper.citationVelocity ? (
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
              {!!paper.inboundCitations ? (
                <Tooltip
                  placement="bottom-start"
                  title={
                    <>
                      <strong>
                        {paper.inboundCitations} citation
                        {paper.inboundCitations !== 1 ? "s" : ""}
                      </strong>
                    </>
                  }
                >
                  <div className="paper-summary__metrics__metric">
                    <InboundCitationIcon width="12" height="12" />
                    {paper.inboundCitations}
                  </div>
                </Tooltip>
              ) : null}
              {!!paper.outboundCitations ? (
                <Tooltip
                  placement="bottom-start"
                  title={
                    <>
                      <strong>
                        {paper.outboundCitations} reference
                        {paper.outboundCitations !== 1 ? "s" : ""}
                      </strong>
                    </>
                  }
                >
                  <div className="paper-summary__metrics__metric">
                    <OutboundCitationIcon width="12" height="12" />
                    {paper.outboundCitations}
                  </div>
                </Tooltip>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="paper-summary__section paper-summary__feedback">
          Does something look wrong? Give us feedback.
          <FeedbackButton
            paperId={this.props.openedPaperId}
            extraContext={{ paperId: paper.s2Id }}
          />
        </div>
      </div>
    );
  }
}
