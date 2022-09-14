import Box from "@mui/material/Box";
import FormGroup from "@mui/material/FormGroup";
import Slider from "@mui/material/Slider";
import React from "react";
import { FacetedHighlight } from "../../api/types";
import * as uiUtils from "../../utils/ui";

interface Props {
  allFacetedHighlights: FacetedHighlight[];
  highlightQuantity: { [facet: string]: number };
  handleHighlightQuantityChanged: (highlightQuantity: {
    [facet: string]: number;
  }) => void;
}

class FacetPalette extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  getAvailableFacets = () => {
    return ["objective", "novelty", "method", "result"];
  };

  render() {
    const { allFacetedHighlights } = this.props;

    const facetDisplayNames = uiUtils.getFacetDisplayNames();
    const facetColors = uiUtils.getFacetColors();

    return (
      <div className="facet-chip-palette-wrapper">
        <div className="facet-chip-palette">
            {this.getAvailableFacets().map((facet) => {
              const numHighlights = allFacetedHighlights.filter(
                (x) => x.label === facet
              ).length;
              return (
                <Box width={"95%"} key={facet}>
                  <span
                    style={{
                      fontSize: "14px",
                      backgroundColor: facetColors[facet],
                      padding: "5px",
                      borderRadius: "5px",
                      width: "fit-content",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      {facetDisplayNames[facet] || facet} ({numHighlights})
                    </span>
                  </span>
                  <Slider
                    // Note: slider colors are hardcoded in .less style files
                    id={`${facet}-quantity-slider`}
                    value={this.props.highlightQuantity[facet]}
                    onChange={(_, value) => {
                      this.props.handleHighlightQuantityChanged({
                        ...this.props.highlightQuantity,
                        [facet]: value as number,
                      });
                    }}
                  />
                </Box>
              );
            })}
        </div>
      </div>
    );
  }
}

export default FacetPalette;
