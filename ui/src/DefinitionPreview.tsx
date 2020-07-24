import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import * as selectors from "./selectors";
import { Entities, Pages } from "./state";
import SymbolPreview from "./SymbolPreview";
import { BoundingBox, isSentence, Sentence, Symbol } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  pdfViewer: PDFViewer;
  pdfDocument: PDFDocumentProxy;
  pages: Pages;
  entities: Entities;
  selectedEntityIds: string[];
}

interface State {
  previewLoaded: boolean;
  /**
   * Time of the last update to the viewport of the viewer. Set this variable to a new value
   * (e.g., using using Date.now()) to trigger components of the overlay to re-render that
   * depend on the scroll position of the viewer (e.g., the 'DefinitionPreview').
   */
  viewerViewportUpdateTimeMs: number;
}

class DefinitionPreview extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      previewLoaded: false,
      viewerViewportUpdateTimeMs: Date.now(),
    };
    this.onPaperClippingLoaded = this.onPaperClippingLoaded.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.addEventListenersToViewer(this.props.pdfViewer);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.pdfViewer !== this.props.pdfViewer) {
      this.removeEventListenersForViewer(prevProps.pdfViewer);
      this.addEventListenersToViewer(this.props.pdfViewer);
    }
  }

  componentWillUnmount() {
    this.removeEventListenersForViewer(this.props.pdfViewer);
  }

  addEventListenersToViewer(pdfViewer: PDFViewer) {
    pdfViewer.container.addEventListener("scroll", this.onScroll);
  }

  removeEventListenersForViewer(pdfViewer: PDFViewer) {
    pdfViewer.container.removeEventListener("scroll", this.onScroll);
  }

  onScroll() {
    this.setState({
      viewerViewportUpdateTimeMs: Date.now(),
    });
  }

  onPaperClippingLoaded() {
    this.setState({
      previewLoaded: true,
    });
  }

  getDefinitionSentenceAndSymbol() {
    let definitionSymbol: Symbol | null = null,
      definitionSentence: Sentence | null = null;

    const { selectedEntityIds, entities } = this.props;

    if (
      selectedEntityIds.length !== 1 ||
      entities === null ||
      selectors.selectedEntityType(selectedEntityIds[0], entities) !== "symbol"
    ) {
      return { definitionSentence, symbol: definitionSymbol };
    }

    const selectedEntityId = selectedEntityIds[0];
    const matchingSymbolIds = selectors.matchingSymbols(
      selectedEntityId,
      entities,
      [{ key: "exact-match", active: true }]
    );
    const firstMatchingSymbolId =
      matchingSymbolIds.length > 0 ? matchingSymbolIds[0] : selectedEntityId;
    definitionSymbol = entities.byId[firstMatchingSymbolId] as Symbol;

    const sentenceId = definitionSymbol.relationships.sentence.id;
    if (sentenceId !== null && entities.byId[sentenceId] !== undefined) {
      const sentence = entities.byId[sentenceId];
      if (isSentence(sentence)) {
        definitionSentence = sentence;
      }
    }
    return { definitionSentence, symbol: definitionSymbol };
  }

  areBoundingBoxesVisible(boundingBoxes: BoundingBox[]) {
    const { pdfViewer, pages } = this.props;

    let visible = false;
    for (const box of boundingBoxes) {
      /*
       * If the page for this box has not yet been loaded into memory, then it is has not yet
       * been rendered, and therefore is not visible.
       */
      if (pages === null) {
        continue;
      }
      const page = pages[box.page + 1];
      if (page === undefined || page === null) {
        continue;
      }

      const {
        scrollLeft,
        scrollTop,
        clientWidth,
        clientHeight,
      } = pdfViewer.container;
      const boxRelativeToPage = uiUtils.getPositionInPageView(page.view, box);

      const boxLeft = page.view.div.offsetLeft + boxRelativeToPage.left;
      const boxRight = boxLeft + boxRelativeToPage.width;
      const boxTop = page.view.div.offsetTop + boxRelativeToPage.top;
      const boxBottom = boxTop + boxRelativeToPage.height;

      /*
       * If the box is not in the scrolled region of the viewer, then it is not visible.
       */
      if (
        boxRight < scrollLeft ||
        boxLeft > scrollLeft + clientWidth ||
        boxTop > scrollTop + clientHeight ||
        boxBottom < scrollTop
      ) {
        continue;
      }

      /*
       * If all of the checks above failed, the box is visible in the viewer.
       */
      visible = true;
      break;
    }

    return visible;
  }

  render() {
    const {
      symbol: definitionSymbol,
      definitionSentence,
    } = this.getDefinitionSentenceAndSymbol();

    /*
     * Show the definition preview if the definition is currently off-screen.
     */
    let isDefinitionOffscreen = false;
    if (definitionSymbol !== null) {
      if (
        definitionSentence !== null &&
        !this.areBoundingBoxesVisible(
          definitionSentence.attributes.bounding_boxes
        )
      ) {
        isDefinitionOffscreen = true;
      } else if (
        !this.areBoundingBoxesVisible(
          definitionSymbol.attributes.bounding_boxes
        )
      ) {
        isDefinitionOffscreen = true;
      }
    }

    if (definitionSymbol === null || !isDefinitionOffscreen) {
      return null;
    }

    /**
     * Initially hide the definition preview, fading it in once the paper preview has loaded.
     * In a typical implementation for fading in this component, the component's opacity would be
     * set to '0' in componentDidMount, and a timeout would be set to start the animation (for example,
     * https://stackoverflow.com/a/40172212/2096369). This
     * timeout is usually critical (see https://stackoverflow.com/a/24195559/2096369). It
     * shouldn't be necessary in our case, as a brief timeout is naturally introduced by the
     * paper preview rendering in the 'SymbolPreview' component.
     */
    let style: React.CSSProperties = {
      opacity: this.state.previewLoaded ? 1 : 0,
      transition: "opacity 0.5s ease",
    };

    return (
      <Card
        ref={(ref: HTMLElement) => (this.element = ref)}
        style={style}
        className="definition-preview"
      >
        <CardContent>
          <SymbolPreview
            pdfDocument={this.props.pdfDocument}
            symbol={definitionSymbol}
            sentence={definitionSentence}
            onLoaded={this.onPaperClippingLoaded}
          />
        </CardContent>
      </Card>
    );
  }

  element: HTMLElement | null = null;
}

export default DefinitionPreview;
