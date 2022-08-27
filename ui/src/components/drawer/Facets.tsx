import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import React from "react";
import { DiscourseObj } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";
import DiscoursePalette from "../discourse/DiscoursePalette";
import FacetSnippet from "./FacetSnippet";

const logger = getRemoteLogger();

interface Props {
  discourseObjs: DiscourseObj[];
  allDiscourseObjs: DiscourseObj[];
  selectedDiscourses: string[];
  highlightQuantity: number;
  showSkimmingAnnotationColors: boolean;
  handleDiscourseSelected: (discourse: string) => void;
  handleJumpToDiscourseObj: (id: string) => void;
  handleHighlightQuantityChanged: (value: number) => void;
  handleSkimmingAnnotationColorsChanged: (value: boolean) => void;
}

export class Facets extends React.PureComponent<Props> {
  handleFacetSnippetClicked = (sentence: DiscourseObj) => {
    logger.log("debug", "click-facet-snippet", {
      discourse: sentence,
    });
    if (this.props.handleJumpToDiscourseObj) {
      this.clearAllSelected();
      this.markAsSelected(`facet-snippet-${sentence.id}`);
      this.markAsSelected(`highlight-${sentence.id}`);

      this.props.handleJumpToDiscourseObj(sentence.id);
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
      discourseObjs,
      allDiscourseObjs,
      selectedDiscourses,
      showSkimmingAnnotationColors,
    } = this.props;

    /**
     * MMDA output does not provide section metadata for spans.
     * We therefore cannot split sentences by section in the sidebar.
     * TODO: Add section headers back when they can be parsed.
     */

    // const bySection = uiUtils
    //   .sortDiscourseObjs(discourseObjs)
    //   .reduce((acc: { [section: string]: DiscourseObj[] }, d: DiscourseObj) => {
    //     // The section attribute contains (when they exist) section, subsection, and
    //     // subsubsection header data, delimited by "@@".
    //     const long_section = d.entity.section;
    //     const section = long_section.split("@@").pop() || "";
    //     if (!acc[section]) {
    //       acc[section] = [];
    //     }
    //     acc[section].push(d);
    //     return acc;
    //   }, {});

    const byPage = uiUtils
      .sortDiscourseObjs(discourseObjs)
      .reduce((acc: { [page: number]: DiscourseObj[] }, d: DiscourseObj) => {
        const page = d.boxes[0]["page"] + 1;
        if (!acc[page]) {
          acc[page] = [];
        }
        acc[page].push(d);
        return acc;
      }, {});

    return (
      <>
        <div>
          <DiscoursePalette
            allDiscourseObjs={allDiscourseObjs}
            selectedDiscourses={selectedDiscourses}
            handleDiscourseSelected={this.props.handleDiscourseSelected}
          ></DiscoursePalette>
        </div>

        <div
          className="document-snippets discourse-objs"
          style={{ marginTop: "9em" }}
        >
          <Box width={"100%"}>
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
            <p>Number of Colors</p>

            <span
              style={{
                fontSize: "16px",
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
                fontSize: "16px",
                margin: "0 auto",
                padding: 0,
              }}
            >
              Multiple
            </span>
          </Box>

          {/* No delimiter */}
          {/* {uiUtils.sortDiscourseObjs(discourseObjs).map((d: DiscourseObj) => {
            return (
              <FacetSnippet
                key={d.id}
                id={d.id}
                color={d.color}
                onClick={() => this.handleFacetSnippetClicked(d)}
                handleJumpToDiscourseObj={this.props.handleJumpToDiscourseObj}
              >
                {d.entity.text}
              </FacetSnippet>
            );
          })} */}

          {/* Page delimiter */}
          {Object.entries(byPage).map(([page, ds], pageIdx: number) => {
            return (
              <React.Fragment key={pageIdx}>
                <p className="discourse-page-header">Page {page}</p>
                {uiUtils.sortDiscourseObjs(ds).map((d: DiscourseObj) => {
                  return (
                    <FacetSnippet
                      key={d.id}
                      id={d.id}
                      color={d.color}
                      onClick={() => this.handleFacetSnippetClicked(d)}
                      handleJumpToDiscourseObj={
                        this.props.handleJumpToDiscourseObj
                      }
                    >
                      {d.entity.text}
                    </FacetSnippet>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Section delimiter */}
          {/* {Object.entries(bySection).map(
            ([section, ds], sectionIdx: number) => {
              return (
                <React.Fragment key={sectionIdx}>
                  <p className="discourse-page-header">{section}</p>
                  {uiUtils.sortDiscourseObjs(ds).map((d: DiscourseObj) => {
                    return (
                      <FacetSnippet
                        key={d.id}
                        id={d.id}
                        color={d.color}
                        onClick={() => this.handleFacetSnippetClicked(d)}
                        handleJumpToDiscourseObj={
                          this.props.handleJumpToDiscourseObj
                        }
                      >
                        {d.entity.text}
                      </FacetSnippet>
                    );
                  })}
                </React.Fragment>
              );
            }
          )} */}
        </div>
      </>
    );
  }
}

export default Facets;
