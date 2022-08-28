import React from "react";
import * as uiUtils from "../../utils/ui";

interface Props {}

export class Legend extends React.PureComponent<Props> {
  render() {
    const facetToColorMap = uiUtils.getFacetColors();

    const facets = {
      novelty: "Novelty",
      objective: "Objective",
      method: "Method",
      result: "Result",
    };

    return (
      <div className={"facet-legend"}>
        {Object.entries(facets).map(([facet, legendText]) => (
          <React.Fragment key={facet}>
            <div
              className={"legend-color-swatch"}
              id={`legend-color-swatch-${facet}`}
              style={{
                backgroundColor: facetToColorMap[facet],
              }}
            ></div>
            <span
              className={"legend-facet-text"}
              id={`legend-facet-text-${facet}`}
            >
              {legendText}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  }
}

export default Legend;
