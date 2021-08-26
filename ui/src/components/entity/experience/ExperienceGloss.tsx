import React from "react";
import MedlineLink from "../experience/MedlineLink";
import { PaperId } from "../../../state";
import { Experience } from "../../../api/types";
import { VoteButton, RichText } from "../../common";
import { Nullable } from '../../../types/ui';
import { getPaper } from '../../../api/api';
import { LinearProgress, Accordion, AccordionSummary, AccordionDetails, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import classNames from "classnames";

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
          error: 'No paper data available',
        });
      }
    }
  
    render() {
      const { isLoadingPaper } = this.state;
      const noPaperComponent = isLoadingPaper ? (
        <div className="paper-summary">
          <div className="paper-summary__loading-msg">
            Loading...
          </div>
          <LinearProgress/>
        </div>
      ) : (
        <div className="paper-summary">
          <div className="paper-summary__loading-msg">
            Error
          </div>
          {this.state.error}
        </div>
      );
      const UrlDefinitions = [];
      for (let i = 0; i < this.props.experience.attributes.urls.length; i++) {
        const url = this.props.experience.attributes.urls[i];
        const snippet = this.props.experience.attributes.snippets[i];
        UrlDefinitions.push({ "url": url, "snippet": snippet });
      }

      const divStyle = {
        overflow: 'scroll',
        maxHeight: '90px',
      };


      const AccordianDefinitions = UrlDefinitions.map((d) => 
      <Accordion>
          <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={"panel-content ${ d.url }"}
                id={"panel-header ${ d.url }"}>  
                    <MedlineLink url={ d.url }>{ d.url }</MedlineLink>                  
                </AccordionSummary>
                <AccordionDetails>
                <div className="paper-summary" style={ divStyle }> { d.snippet } </div>
                </AccordionDetails>
            </Accordion>
        );
      
      const Definitions = UrlDefinitions.map((d) => 
        <RichText>{`${ d.snippet }`}</RichText>);

      const urls = UrlDefinitions.map((d) => 
        <MedlineLink url={ d.url }>{ d.url }</MedlineLink>);


      return (
        <div className={classNames("gloss", "term-gloss", "simple-gloss")}>
          
          <table>
            <tbody>
              <td>
              <div className="simple-gloss__definition-container"> {Definitions} </div> 
              <div className="simple-gloss__definition-container"> {urls} </div> 
              </td>
            </tbody>
          </table>
      </div>
    );
    }
  }
  