import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
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
  selectedFacets: string[];
  highlightQuantity: number;
  showSkimmingAnnotationColors: boolean;
  handleFacetSelected: (facet: string) => void;
  handleJumpToHighlight: (id: string) => void;
  handleHighlightQuantityChanged: (value: number) => void;
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

  render() {
    const {
      facetedHighlights,
      allFacetedHighlights,
      selectedFacets,
      showSkimmingAnnotationColors,
    } = this.props;

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

    // const byPage = uiUtils
    //   .sortFacetedHighlights(facetedHighlights)
    //   .reduce(
    //     (acc: { [page: number]: FacetedHighlight[] }, d: FacetedHighlight) => {
    //       const page = d.boxes[0]["page"] + 1;
    //       if (!acc[page]) {
    //         acc[page] = [];
    //       }
    //       acc[page].push(d);
    //       return acc;
    //     },
    //     {}
    //   );

    return (
      <div className="document-snippets facet-objs">
        <div
          style={{
            border: "1px solid grey",
            padding: "5px",
            borderRadius: "3px",
          }}
        >
          <p>Facets</p>
          <FacetPalette
            allFacetedHighlights={allFacetedHighlights}
            selectedFacets={selectedFacets}
            handleFacetSelected={this.props.handleFacetSelected}
          ></FacetPalette>
          <Box width={"95%"}>
            <p>Number of highlights</p>
            <Slider
              value={this.props.highlightQuantity}
              step={10}
              marks
              onChange={(_, value) =>
                this.props.handleHighlightQuantityChanged(value as number)
              }
            />
          </Box>
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
              checked={showSkimmingAnnotationColors}
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
        </div>

        {/* Page delimiter */}
        {/* {Object.entries(byPage).map(([page, ds], pageIdx: number) => {
            return (
              <React.Fragment key={pageIdx}>
                <p className="facet-page-header">Page {page}</p>
                {uiUtils
                  .sortFacetedHighlights(ds)
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
          })} */}

        {/* Section delimiter */}
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
