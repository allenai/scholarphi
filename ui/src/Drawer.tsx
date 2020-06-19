import MuiDrawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import FeedbackButton from "./FeedbackButton";
import PaperList from "./PaperList";
import SearchResults from "./SearchResults";
import {
  MathMls,
  PaperId,
  Papers,
  SelectableEntityType,
  Sentences,
  Symbols,
} from "./state";
import { UserLibrary } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";

const PDF_VIEWER_DRAWER_OPEN_CLASS = "drawer-open";

export type DrawerMode = "open" | "closed";

interface Props {
  paperId: PaperId | undefined;
  pdfViewer: PDFViewer;
  pdfDocument: PDFDocumentProxy | null;
  mode: DrawerMode;
  papers: Papers | null;
  symbols: Symbols | null;
  mathMls: MathMls | null;
  sentences: Sentences | null;
  userLibrary: UserLibrary | null;
  selectedEntityType: SelectableEntityType;
  selectedEntityId: string | null;
  handleClose: () => void;
  handleSelectSymbol: (id: string) => void;
  handleScrollSymbolIntoView: () => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
}

export class Drawer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.closeDrawer = this.closeDrawer.bind(this);
  }

  componentWillUnmount() {
    const { pdfViewer } = this.props;
    if (pdfViewer != null) {
      this.removePdfPositioningForDrawerOpen(pdfViewer.viewer);
    }
  }

  positionPdfForDrawerOpen(pdfViewerContainer: HTMLElement) {
    /*
     * Creating padding for scroll
     */
    Array.from(pdfViewerContainer.children).forEach((page) => {
      // XXX(zkirby, andrewhead) per our discussion at https://github.com/allenai/scholar-reader/pull/38/files#r388514946
      // this is 'safe' as pages are not deleted when scrolled out of view (just their inner content).
      page.classList.add(PDF_VIEWER_DRAWER_OPEN_CLASS);
    });

    const { mode, selectedEntityType } = this.props;
    if (mode === "open" && selectedEntityType === "symbol") {
      this.props.handleScrollSymbolIntoView();
    }
  }

  removePdfPositioningForDrawerOpen(pdfViewerContainer: HTMLElement) {
    Array.from(pdfViewerContainer.children).forEach((page) => {
      page.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
    });
  }

  closeDrawer() {
    if (this.props.mode !== "closed") {
      this.props.handleClose();
    }
  }

  render() {
    /**
     * The PDF viewer should know if the drawer is open so it can reposition the paper. Currently, we
     * notify the PDF viewer by adding a class, as the PDF viewer otherwise has no knowledge of the
     * state of this React application.
     */
    const {
      paperId,
      pdfViewer,
      pdfDocument,
      mode,
      symbols,
      mathMls,
      sentences,
      selectedEntityType,
      selectedEntityId,
      handleSelectSymbol,
    } = this.props;
    if (pdfViewer != null) {
      if (mode === "open") {
        this.positionPdfForDrawerOpen(pdfViewer.viewer);
      } else {
        this.removePdfPositioningForDrawerOpen(pdfViewer.viewer);
      }
    }

    const feedbackContext = {
      mode,
      selectedEntityType,
      selectedEntityId,
    };
    return (
      <MuiDrawer
        className="drawer"
        variant="persistent"
        anchor="right"
        open={mode !== "closed"}
      >
        <div className="drawer__header">
          <div className="drawer__close_icon">
            <IconButton
              className="MuiButton-contained"
              onClick={this.closeDrawer}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
          <FeedbackButton paperId={paperId} extraContext={feedbackContext} />
        </div>
        <div className="drawer__content">
          {mode === "open" &&
            selectedEntityType === "symbol" &&
            pdfDocument !== null && (
              <SearchResults
                pdfDocument={pdfDocument}
                pageSize={4}
                symbols={symbols}
                mathMls={mathMls}
                sentences={sentences}
                selectedEntityType={selectedEntityType}
                selectedEntityId={selectedEntityId}
                handleSelectSymbol={handleSelectSymbol}
              />
            )}
          {mode === "open" && selectedEntityType === "citation" && (
            <PaperList
              papers={this.props.papers}
              userLibrary={this.props.userLibrary}
              handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
            />
          )}
        </div>
      </MuiDrawer>
    );
  }
}

export default Drawer;
