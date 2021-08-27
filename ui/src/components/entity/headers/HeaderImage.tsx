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
    entity: SectionHeader;
    pageView: PDFPageView;
  }

  export default class SectionHeaderImage extends React.PureComponent<Props, {}> {
  
    render() {

        const boundingBoxes = this.props.entity.attributes.bounding_boxes;

        // console.log(this.props.entity);
        // update so to the side of the text
        boundingBoxes.map((box) => {box['left'] = box['left']});


        const shouldFlip = boundingBoxes[0]['left'] >= 0.5;

        const imgClass = shouldFlip ? "section-header-annotation-img-flipped": "section-header-annotation-img";
        return (
            <div className={classNames("scholar-reader-annotation-span", imgClass)}
                style={uiUtils.getPositionInPageView(
                            this.props.pageView,
                            boundingBoxes[0],
                        )}>
              </div>    
        );
        
  }   
} 
  