import React from "react";
import PaperClipping from "./PaperClipping";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { ScholarReaderContext } from "./state";
import { Sentence } from "./types/api";
import { divDimensionStyles } from './selectors/annotation';

interface ToolTipSentenceProps {
  firstMatchingSentence: Sentence | undefined;
}

export default class ToolTipSentence extends React.PureComponent<ToolTipSentenceProps, {}> {
  state = { shouldRenderToolTip: true }

  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  componentDidMount() {
    const { pdfViewer } = this.context;
    pdfViewer?.container.addEventListener("scroll", this.listenForScroll.bind(this));
  }

  componentWillUnmount() {
    const { pdfViewer } = this.context;
    pdfViewer?.container.removeEventListener("scroll", this.listenForScroll.bind(this));

  }

  listenForScroll({ srcElement }: any) {
    const { pages } = this.context;
    const { firstMatchingSentence } = this.props;
    const { shouldRenderToolTip } = this.state;

    if (firstMatchingSentence) {
      const page = pages && pages[firstMatchingSentence.bounding_boxes[0].page + 1]?.view
      if (page) {
        const pageTopPosition = page.div.offsetTop;
        const { top, height } = divDimensionStyles(page, firstMatchingSentence.bounding_boxes[0]);
        const currScrollPosition = srcElement?.scrollTop || 0;

        const topBound = currScrollPosition > (pageTopPosition + top + height);
        const bottomBound = currScrollPosition + window.innerHeight < pageTopPosition + top;
        const shouldRender = topBound || bottomBound;
        if (shouldRender !== shouldRenderToolTip) {
          this.setState({ shouldRenderToolTip: shouldRender });
        }
      } else {
        // ensure that the tooltip is showing if the page hasn't
        // rendered yet. 
        if (!shouldRenderToolTip) {
          this.setState({ shouldRenderToolTip: true })
        }
      }
    }
  }

  render() {
    const { shouldRenderToolTip } = this.state;
    return (
      <div className={`tooltip-sentence__container ${shouldRenderToolTip ? "visible" : ""}`}>
        <ScholarReaderContext.Consumer>
        {({ symbols, selectedEntityId, pdfViewer }) => {
          const { firstMatchingSentence } = this.props;
          if (!firstMatchingSentence || !selectedEntityId || !symbols) {
            return null;
          } else {
            // we need to run the scroll handler one time when a new
            // sentence is selected. This is a bad practice and should be change
            // when there is a new method of sharing data between components.
            this.listenForScroll({ 
              srcElement: pdfViewer?.container,
            })
          }
          
          return (
            shouldRenderToolTip ? 
            <Card> 
              <CardContent>
                <PaperClipping 
                  pageNumber={symbols.byId[selectedEntityId].bounding_boxes[0].page + 1}
                  sentenceId={firstMatchingSentence.id}
                  highlights={[symbols.byId[selectedEntityId].bounding_boxes[0]]}
                />
              </CardContent>
            </Card> : null
          )}}
        </ScholarReaderContext.Consumer>
      </div>
    )
  }
}

