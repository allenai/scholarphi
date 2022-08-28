import React from "react";
import { FacetedHighlight } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";
import FacetTagChip from "./FacetTagChip";

const logger = getRemoteLogger();

interface Props {
  allFacetedHighlights: FacetedHighlight[];
  selectedFacets: string[];
  handleFacetSelected: (facet: string) => void;
}

interface State {
  firstSelection: boolean;
}

class FacetPalette extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  onClickTag = (tag: string) => {
    logger.log("debug", "click-facet-tag", { tag: tag });
    this.props.handleFacetSelected(tag);
  };

  onClickEverything = () => {
    logger.log("debug", "click-all-facets-tag");
    this.props.handleFacetSelected("all");
  };

  getAvailableFacets = () => {
    return ["objective", "novelty", "method", "result"];
  };

  render() {
    const { selectedFacets, allFacetedHighlights } = this.props;

    const facetDisplayNames = uiUtils.getFacetDisplayNames();
    const facetColors = uiUtils.getFacetColors();

    return (
      <div className="facet-chip-palette-wrapper">
        <p className="facet-palette-header">Show me...</p>
        <div className="facet-chip-palette">
          <div className="facet-chip-palette__tags">
            {this.getAvailableFacets().map((facet) => {
              return (
                <FacetTagChip
                  key={facet}
                  id={facet}
                  name={`${facetDisplayNames[facet] || facet} (${
                    allFacetedHighlights.filter((x) => x.label === facet).length
                  })`}
                  selected={selectedFacets.includes(facet)}
                  color={facetColors[facet]}
                  handleSelection={this.onClickTag}
                />
              );
            })}
          </div>
          <div className="facet-chip-palette__everything">
            <FacetTagChip
              id="everything"
              className="everything-chip"
              name={"Everything"}
              selected={selectedFacets.length > 0}
              color={"lightgray"}
              handleSelection={this.onClickEverything}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FacetPalette;
