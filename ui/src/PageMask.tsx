import React from "react";
import { ScholarReaderContext } from "./state";
import { Sentence } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface PageMaskProps {
  pageView: PDFPageView;
  pageNumber: number;
}

export class PageMask extends React.PureComponent<PageMaskProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  render() {
    const maskId = `page-${this.props.pageNumber}-mask`;
    const pageWidth = this.props.pageView.div.scrollWidth;
    const pageHeight = this.props.pageView.div.scrollHeight;

    // Here are some old TODOs
    /*
     * TODO(andrewhead): fix this data to be relational to enable quicker lookups.
     */
    /*
     * TODO(andrewhead): find a better way of storing the ID; maybe a structure that includes
     * the type? Also need better naming for selection vs. selected annotation.
     */
    // TODO(andrewhead): sentence shouldn't be set to '0' if no sentence was found.

    /*
     * TODO(andrewhead): Refactor this:
     * * Better lookups from symbol IDs to sentence IDs
     * * Try moving it into the inline TSX
     * * Get rid of the dreadful ID lookup by splitting the selected annotation ID
     */
    let sentences: Sentence[] = [];
    if (this.context.selectedAnnotationId != null) {
      const [
        typeSelected,
        idSelected
      ] = this.context.selectedAnnotationId.split("-");
      if (typeSelected !== "symbol") {
        return false;
      }
      const symbolIds = this.context.symbolMatches[Number(idSelected)];
      symbolIds.add(Number(idSelected));
      const symbols = this.context.symbols.filter(s => symbolIds.has(s.id));
      const sentenceIds = symbols.filter(s => s !== null).map(s => s.sentence);
      sentences = this.context.sentences.filter(
        s => sentenceIds.indexOf(s.id) !== -1
      );
    }

    // TODO(andrewhead): Add back in the highlighting of sentences.
    // {
    //   sentences.length > 0 && (
    //     <Annotation
    //       className="sentence-highlight"
    //       boundingBoxes={sentences[0].bounding_boxes}
    //       id={String(sentences[0].id)}
    //       tooltipContent={null}
    //       key={sentences[0].id}
    //     />
    //   );
    // }

    // TODO(andrewhead): Update API to work even if sentences not found.
    // TODO(andrewhead): Update UI to work even if sentences not returned by API.

    return (
      <ScholarReaderContext.Consumer>
        {({ selectedAnnotationId }) =>
          selectedAnnotationId !== null ? (
            /* TODO(andrewhead): check that the width and height are what we expect. */
            /* TODO(andrewhead): do we need guards to make sure width and height are defined? */
            /* TODO(andrewhead): only apply the mask if there is sentences data. */
            /* TODO(andrewhead): fix up bug: why on clicks of mutliple elements consecutively does the mask start moving downward? */
            /*
             * TODO(andrewhead): figure out a more flexible way of triggering changes to height and
             * width that will consistently get notified when these properties change on the div.
             * Maybe I can pass them in as properties? As long as PageOverlay generation gets
             * retriggered whenever the re-render happens.
             */
            <svg width={pageWidth} height={pageHeight}>
              <mask id={maskId}>
                {/*
                 * Where the SVG mask is white, the overlay mask will show. Start by showing the
                 * mask everywhere, and subtract from it. Setting the fill to "white" sets the
                 * initial mask area as the entire page. Setting the fill to "black" (as with the
                 * rectangles below) subtracts from the mask.
                 */}
                <rect width={pageWidth} height={pageHeight} fill="white" />
                {/*
                 * Subtract from the mask wherever a sentence should be activated.
                 */}
                {sentences.map(s => (
                  <>
                    {s.bounding_boxes
                      .filter(b => b.page === this.props.pageNumber - 1)
                      .map(b => (
                        <rect
                          x={b.left * pageWidth}
                          y={b.top * pageHeight}
                          width={b.width * pageWidth}
                          height={b.height * pageHeight}
                          fill="black"
                        />
                      ))}
                  </>
                ))}
              </mask>
              <rect
                width={pageWidth}
                height={pageHeight}
                fill={"white"}
                opacity={0.5}
                mask={`url(#${maskId})`}
              />
              {sentences.slice(0, 1).map(s => (
                <>
                  {s.bounding_boxes
                    .filter(b => b.page === this.props.pageNumber - 1)
                    .map(b => (
                      <rect
                        x={b.left * pageWidth}
                        y={b.top * pageHeight}
                        width={b.width * pageWidth}
                        height={b.height * pageHeight}
                        fill="green"
                        opacity={0.2}
                      />
                    ))}
                </>
              ))}
            </svg>
          ) : null
        }
      </ScholarReaderContext.Consumer>
    );
  }
}

export default PageMask;
