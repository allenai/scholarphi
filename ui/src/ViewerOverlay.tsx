import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import DefinitionPreview from "./DefinitionPreview";
import Drawer, { DrawerMode } from "./Drawer";
import FindBar, { FindMode, FindQuery } from "./FindBar";
import { matchingSymbols } from "./selectors";
import {
  MathMls,
  PaperId,
  Papers,
  SelectableEntityType,
  Sentences,
  Symbols,
} from "./state";
import { UserLibrary } from "./types/api";
import { PDFViewer, PDFViewerApplication } from "./types/pdfjs-viewer";
import * as uiUtils from "./ui-utils";

interface Props {
  pdfViewerApplication: PDFViewerApplication;
  pdfViewer: PDFViewer;
  pdfDocument: PDFDocumentProxy | null;
  paperId?: PaperId;
  papers: Papers | null;
  symbols: Symbols | null;
  mathMls: MathMls | null;
  sentences: Sentences | null;
  userLibrary: UserLibrary | null;
  selectedEntityType: SelectableEntityType;
  selectedEntityId: string | null;
  isFindActive: boolean;
  findActivationTimeMs: number | null;
  findMode: FindMode;
  findQuery: FindQuery;
  findMatchIndex: number | null;
  findMatchCount: number | null;
  drawerMode: DrawerMode;
  handleCloseFindBar: () => void;
  handleCloseDrawer: () => void;
  handleChangeMatchIndex: (matchIndex: number | null) => void;
  handleChangeMatchCount: (matchCount: number | null) => void;
  handleChangeQuery: (query: FindQuery | null) => void;
  handleDeselectSelection: () => void;
  handleSelectSymbol: (id: string) => void;
  handleScrollSymbolIntoView: () => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
}

/**
 * Determine whether a click event targets a selectable element.
 */
function isClickEventInsideSelectable(event: MouseEvent) {
  return (
    event.currentTarget instanceof HTMLDivElement &&
    event.currentTarget.classList.contains("scholar-reader-annotation-span")
  );
}

/**
 * An overlay on top of the PDF Viewer containing widgets to be shown on top of the viewer, and
 * event handlers that trigger state changes based on click and keyboard
 * events. This overlay currently operates by adding event handlers to the container of
 * the PDF viewer generated by pdf.js. The component does not make any new DOM elements.
 *
 * In a past implementation, this component added a transparent overlay 'div' element on top of
 * the PDF viewer. That implementation was abandoned because the overlay intercepted click and
 * keyboard events that were meant for the page or for annotations on the page. In the current
 * implementation, clicks on the page or annotations will be processed by the page or annotation
 * *and* processed by this overlay, as in this overlay, event handlers are attached to a
 * parent element of all pages and annotations.
 */
class ViewerOverlay extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
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
    pdfViewer.container.addEventListener("click", this.onClick);
    pdfViewer.container.addEventListener("keyup", this.onKeyUp);
  }

  removeEventListenersForViewer(pdfViewer: PDFViewer) {
    pdfViewer.container.removeEventListener("click", this.onClick);
    pdfViewer.container.removeEventListener("keyup", this.onKeyUp);
  }

  onClick(event: MouseEvent) {
    if (!isClickEventInsideSelectable(event)) {
      this.props.handleDeselectSelection();
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (uiUtils.isKeypressEscape(event)) {
      this.props.handleDeselectSelection();
    }
  }

  getDefinitionSentenceAndSymbol() {
    let selectedSymbol = null,
      selectedSentence = null;
    const {
      selectedEntityType,
      selectedEntityId,
      symbols,
      mathMls,
      sentences,
    } = this.props;

    if (
      selectedEntityType !== "symbol" ||
      selectedEntityId === null ||
      symbols === null ||
      mathMls === null
    ) {
      return { selectedSymbol: null, selectedSentence: null };
    }

    selectedSymbol = symbols.byId[selectedEntityId];
    matchingSymbols(selectedEntityId, symbols, mathMls, [
      { key: "exact-match", active: true },
    ]);

    if (selectedSymbol.sentence !== null && sentences !== null) {
      selectedSentence = sentences.byId[selectedSymbol.sentence];
    }
    return { selectedSymbol, selectedSentence };
  }

  render() {
    const {
      selectedSymbol,
      selectedSentence,
    } = this.getDefinitionSentenceAndSymbol();

    return (
      <>
        {this.props.isFindActive && this.props.findActivationTimeMs !== null ? (
          <FindBar
            /*
             * Set the key for the widget to the time that the find event was activated
             * (i.e., when 'Ctrl+F' was typed). This regenerates the widgets whenever
             * a new 'find' action is started, which will select and focus the text
             * in the search widget. See why we use key to regenerate component here:
             * https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
             */
            key={this.props.findActivationTimeMs}
            matchCount={this.props.findMatchCount}
            matchIndex={this.props.findMatchIndex}
            mode={this.props.findMode}
            pdfViewerApplication={this.props.pdfViewerApplication}
            query={this.props.findQuery}
            handleChangeMatchCount={this.props.handleChangeMatchCount}
            handleChangeMatchIndex={this.props.handleChangeMatchIndex}
            handleChangeQuery={this.props.handleChangeQuery}
            handleClose={this.props.handleCloseFindBar}
          />
        ) : null}
        <Drawer
          paperId={this.props.paperId}
          pdfViewer={this.props.pdfViewer}
          pdfDocument={this.props.pdfDocument}
          mode={this.props.drawerMode}
          userLibrary={this.props.userLibrary}
          papers={this.props.papers}
          symbols={this.props.symbols}
          mathMls={this.props.mathMls}
          sentences={this.props.sentences}
          selectedEntityType={this.props.selectedEntityType}
          selectedEntityId={this.props.selectedEntityId}
          handleSelectSymbol={this.props.handleSelectSymbol}
          handleScrollSymbolIntoView={this.props.handleScrollSymbolIntoView}
          handleClose={this.props.handleCloseDrawer}
          handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
        />
        {this.props.pdfDocument !== null && selectedSymbol !== null ? (
          <DefinitionPreview
            pdfDocument={this.props.pdfDocument}
            symbol={selectedSymbol}
            sentence={selectedSentence}
          />
        ) : null}
      </>
    );
  }
}

export default ViewerOverlay;