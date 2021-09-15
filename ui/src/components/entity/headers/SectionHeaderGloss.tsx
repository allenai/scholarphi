import React from "react";
import { SectionHeader } from "../../../api/types";

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
    const bullets = this.props.header.attributes.points.map((d) => (
      <ul>
        <li>{d}</li>
      </ul>
    ));

    return (
      <div className="gloss citation-gloss">
        <div className="gloss__section">
          <div className="paper-summary">
            <div className="paper-summary__section">
              <span className="summary-name">Section summary</span>:{" "}
              {this.props.header.attributes.summary}
              <div className="experience-summary__section source"><p> Generated automatically </p></div>
              {/* <div className="paper-summary__section"> {bullets} </div>  */}
            </div>
          </div>
          <p></p>
        </div>
      </div>
    );
  }
}
