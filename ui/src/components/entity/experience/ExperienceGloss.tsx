import { LinearProgress } from "@material-ui/core";
import classNames from "classnames";
import React from "react";
import { Experience } from "../../../api/types";
import { Nullable } from "../../../types/ui";
import MedlineLink from "../experience/MedlineLink";

interface Props {
  experience: Experience;
}

interface State {
  error: Nullable<string>;
  isLoadingPaper: boolean;
}

export default class ExperienceGloss extends React.PureComponent<Props, State> {
  state = {
    error: null,
    isLoadingPaper: false,
  };

  // probably wrong at this point
  componentDidMount() {
    if (!!this.props.experience.attributes.experience_id) {
      const paperId = this.props.experience.attributes.experience_id;
    } else {
      this.setState({
        error: "No paper data available",
      });
    }
  }

  render() {
    const { isLoadingPaper } = this.state;
    const noPaperComponent = isLoadingPaper ? (
      <div className="paper-summary">
        <div className="paper-summary__loading-msg">Loading...</div>
        <LinearProgress />
      </div>
    ) : (
      <div className="paper-summary">
        <div className="paper-summary__loading-msg">Error</div>
        {this.state.error}
      </div>
    );
    const UrlDefinitions = [];
    for (let i = 0; i < this.props.experience.attributes.urls.length; i++) {
      const url = this.props.experience.attributes.urls[i];
      const snippet = this.props.experience.attributes.snippets[i];
      UrlDefinitions.push({ url: url, snippet: snippet });
    }

    const divStyle = {
      overflow: "scroll",
      maxHeight: "100px",
    };

    const Definitions = UrlDefinitions.map((d) => (
      <div className="experience-summary__section">
        <p className="experience-summary__abstract">{`${d.snippet}`}</p>
      </div>
    ));

    const urls = UrlDefinitions.map((d) => (
      <MedlineLink url={d.url}>{d.url}</MedlineLink>
    ));

    return (
      <div className={classNames("gloss", "term-gloss", "simple-gloss")}>
        <table>
          <tbody>
            <td>
              <div className="experience-summary__section">{Definitions}</div>
              <div className="experience-summary__section source">{urls}</div>

              {/* <div className="simple-gloss__definition-container"> {Definitions} </div> 
              <div className="simple-gloss__definition-container"> {urls} </div>  */}
            </td>
          </tbody>
        </table>
      </div>
    );
  }
}
