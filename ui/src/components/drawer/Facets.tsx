import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import React from "react";
import { FacetedHighlight } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";
import FacetPalette from "../faceted-highlights/FacetPalette";
import FacetSnippet from "./FacetSnippet";

const logger = getRemoteLogger();

interface Props {
  facetedHighlights: FacetedHighlight[];
  allFacetedHighlights: FacetedHighlight[];
  highlightQuantity: { [facet: string]: number };
  showSkimmingAnnotationColors: boolean;
  handleJumpToHighlight: (id: string) => void;
  handleHighlightQuantityChanged: (highlightQuantity: {
    [facet: string]: number;
  }) => void;
  handleSkimmingAnnotationColorsChanged: (value: boolean) => void;
}

export class Facets extends React.PureComponent<Props> {
  handleFacetSnippetClicked = (sentence: FacetedHighlight) => {
    logger.log("debug", "click-facet-snippet", {
      highlight: sentence,
    });
    if (this.props.handleJumpToHighlight) {
      this.clearAllSelected();
      this.markAsSelected(`facet-snippet-${sentence.id}`);
      this.markAsSelected(`highlight-${sentence.id}`);

      this.props.handleJumpToHighlight(sentence.id);
    }
  };

  markAsSelected = (classname: string) => {
    uiUtils.addClassToElementsByClassname(classname, "selected");
  };

  clearAllSelected = () => {
    uiUtils.removeClassFromElementsByClassname("selected");
  };

  handleSkimmingAnnotationColorsChanged = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    this.props.handleSkimmingAnnotationColorsChanged(checked);
  };

  getSingleColorHighlightToggle = () => {
    return (
      <Box width={"100%"}>
        <p>Number of colors</p>

        <span
          style={{
            fontSize: "14px",
            margin: "0 auto",
            padding: 0,
          }}
        >
          Single
        </span>
        <Switch
          checked={this.props.showSkimmingAnnotationColors}
          onChange={this.handleSkimmingAnnotationColorsChanged}
        />
        <span
          style={{
            fontSize: "14px",
            margin: "0 auto",
            padding: 0,
          }}
        >
          Multiple
        </span>
      </Box>
    );
  };

  render() {
    const { facetedHighlights, allFacetedHighlights, highlightQuantity } =
      this.props;

    const bySection = uiUtils
      .sortFacetedHighlights(facetedHighlights)
      .reduce(
        (
          acc: { [section: string]: FacetedHighlight[] },
          d: FacetedHighlight
        ) => {
          // The section attribute contains (when they exist) section, subsection, and
          // subsubsection header data, delimited by "@@".
          const long_section = d.section;
          const section = long_section.split("@@").pop() || "";
          if (!acc[section]) {
            acc[section] = [];
          }
          acc[section].push(d);
          return acc;
        },
        {}
      );

    return (
      <div className="document-snippets facet-objs">
        <div
          style={{
            border: "1px solid grey",
            padding: "5px",
            borderRadius: "3px",
          }}
        >
          <FacetPalette
            allFacetedHighlights={allFacetedHighlights}
            highlightQuantity={highlightQuantity}
            handleHighlightQuantityChanged={
              this.props.handleHighlightQuantityChanged
            }
          ></FacetPalette>
          {/* {this.getSingleColorHighlightToggle()} */}
        </div>

        {/* Section-delimited highlight snippets */}
        {Object.entries(bySection).map(([section, ds], sectionIdx: number) => {
          return (
            <React.Fragment key={sectionIdx}>
              <p className="facet-page-header">{section}</p>
              {uiUtils
                .sortFacetedHighlights(ds)
                .filter((d: FacetedHighlight) => d.label !== "ignore")
                .map((d: FacetedHighlight) => {
                  return (
                    <FacetSnippet
                      key={d.id}
                      id={d.id}
                      color={d.color}
                      onClick={() => this.handleFacetSnippetClicked(d)}
                      handleJumpToHighlight={this.props.handleJumpToHighlight}
                    >
                      {d.text}
                    </FacetSnippet>
                  );
                })}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}

export default Facets;
