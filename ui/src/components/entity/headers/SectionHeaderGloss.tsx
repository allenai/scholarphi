import React from "react";
import { SectionHeader } from "../../../api/types";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import classNames from "classnames";


/* very simple gloss that displays simplified version of a highlighted section */
interface Props {
    header: SectionHeader;
  }

  export default class SectionHeaderGloss extends React.PureComponent<Props, {}> {
  
    render() {

        const bullets = this.props.header.attributes.points.map((d) => 
        <ul>
            <li> 
                {d}
            </li>
                    
        </ul>
            );

        return ( <div className="gloss citation-gloss">
                <div className="gloss__section">
                <div className="paper-summary">
                    <div className="paper-summary__section">
                        <p className="paper-summary__title">
                            { this.props.header.attributes.summary }
                        </p>
                    </div>
                        <div className="paper-summary__section"> {bullets} </div> 
                    </div>
                </div>
            </div>
        );
        
  }   
} 
  