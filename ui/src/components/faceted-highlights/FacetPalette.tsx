import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import React from "react";
import { FacetedHighlight } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";

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

  onFacetSelected = (tag: string) => {
    logger.log("debug", "click-facet-tag", { tag: tag });
    this.props.handleFacetSelected(tag);
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
        <div className="facet-chip-palette">
          <FormGroup>
            {this.getAvailableFacets().map((facet) => {
              const numHighlights = allFacetedHighlights.filter(
                (x) => x.label === facet
              ).length;
              const checked =
                selectedFacets.includes(facet) && numHighlights > 0;
              return (
                <FormControlLabel
                  key={facet}
                  control={
                    <Switch
                      disabled={numHighlights === 0}
                      checked={checked}
                      onChange={() => this.props.handleFacetSelected(facet)}
                    />
                  }
                  label={
                    <div
                      style={{
                        backgroundColor: facetColors[facet],
                        padding: "5px",
                        borderRadius: "5px",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>
                        {facetDisplayNames[facet] || facet} ({numHighlights})
                      </span>
                    </div>
                  }
                />
              );
            })}
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default FacetPalette;
