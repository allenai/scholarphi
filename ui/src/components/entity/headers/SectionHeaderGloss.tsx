import React from "react";
import { SectionHeader, BoundingBox } from "../../../api/types";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import classNames from "classnames";
import Annotation from "../Annotation";
import { GlossStyle } from "../../../settings";
import { TooltipPlacement } from "../../common";
import { Entity } from "../../../api/types";
import { PDFPageView } from "../../../types/pdfjs-viewer";
import * as uiUtils from "../../../utils/ui";




/* simple gloss that displays simplified version of a highlighted section
Because we want the gloss to always show some information in the sidebar,
Use the full entity annotation here and render the gloss next to the underline
*/
interface Props {
    header: SectionHeader;
  }
// interface Props {
//     header: SectionHeader;
//   }

  export default class SectionHeaderGloss extends React.PureComponent<Props, {}> {
  
    render() {

        // const boundingBoxes = this.props.entity.attributes.bounding_boxes;

        // console.log(this.props.entity);
        // update so to the side of the text
        // boundingBoxes.map((box) => {box['left'] = box['left'] - 0.07});

        // console.log(boundingBoxes);

        const bullets = this.props.header.attributes.points.map((d) => 
        <ul>
            <li> 
                {d}
            </li>
                    
        </ul>
            );
        // const annotation = <Annotation
        // pageView={this.props.pageView}
        // id={this.props.id}
        // className={classNames(this.props.className, {
        //   "find-match": this.props.isFindMatch,
        //   "find-selection": this.props.isFindSelection,
        // })}
        // active={this.props.active}
        // underline={this.props.underline}
        // selected={this.props.selected}
        // selectedSpanIds={this.props.selectedSpanIds}
        // boundingBoxes={this.props.entity.attributes.bounding_boxes}
        // source={this.props.entity.attributes.source}
        // glossStyle={this.props.glossStyle}
        // glossContent={this.props.glossContent}
        // tooltipPlacement={this.props.tooltipPlacement}/> 

        // style={uiUtils.getPositionInPageView(
        //     this.props.pageView,
        //     boundingBoxes[0],
        //   )}

        return (
            
            <div className={classNames("gloss", "term-gloss", "simple-gloss")}
            >
                <div className="gloss__section">
                <div className="paper-summary">
                    <div className="paper-summary__section">
                        <p className="paper-summary__title">
                            Section summary:
                        </p>
                        { this.props.header.attributes.summary }
                    </div>
                        {/* <div className="paper-summary__section"> {bullets} </div>  */}
                    </div>
                </div>
            </div>
          
                
        );
        
  }   
} 
  