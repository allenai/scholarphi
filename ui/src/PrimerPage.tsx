import LinearProgress from "@material-ui/core/LinearProgress";
import React from "react";
import ReactDOM from "react-dom";
import { Entities, Pages } from "./state";
import SymbolDefinitionGloss from "./SymbolDefinitionGloss";
import TermDefinitionGloss from "./TermDefinitionGloss";
import { isSymbol, isTerm, Symbol, Term } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";

interface Props {
  pdfViewer: PDFViewer;
  pages: Pages;
  entities: Entities | null;
  showInstructions: boolean;
  annotationHintsEnabled: boolean;
  termGlossesEnabled: boolean;
  scrollToPageOnLoad?: boolean;
  handleSetAnnotationHintsEnabled: (enabled: boolean) => void;
}

/**
 * A page that appears at the start of the document containing a primer about the document.
 * The primer is rendered by directly inserting it into the viewer with calls to
 * 'appendChild', 'insertBefore', and 'removeChild'. It is not rendered into the viewer using
 * ReactDOM.createPortal because the primer must be inserted as the first child of the
 * viewer, while preserving all other children of the viewer (i.e., the other pages).
 */
class PrimerPage extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this._welcomeElement = document.createElement("div");
    this._welcomeElement.classList.add("primer-page");
    this._glossaryElement = document.createElement("div");
    this._glossaryElement.classList.add("primer-page");

    this.onAnnotationHintsEnabledChanged = this.onAnnotationHintsEnabledChanged.bind(
      this
    );
  }

  componentDidMount() {
    /*
     * TODO(andrewhead): Also attach the glossary page.
     */
    const { viewer } = this.props.pdfViewer;
    if (viewer.children.length === 0) {
      viewer.appendChild(this._welcomeElement);
      viewer.appendChild(this._glossaryElement);
    } else {
      viewer.insertBefore(this._glossaryElement, viewer.children[0]);
      viewer.insertBefore(this._welcomeElement, viewer.children[0]);
    }
    if (this.props.scrollToPageOnLoad) {
      this.props.pdfViewer.container.scrollTop = 0;
    }
  }

  componentWillUnmount() {
    const { viewer } = this.props.pdfViewer;
    if (
      document.body.contains(viewer) &&
      viewer.contains(this._welcomeElement)
    ) {
      viewer.removeChild(this._welcomeElement);
    }
    if (
      document.body.contains(viewer) &&
      viewer.contains(this._glossaryElement)
    ) {
      viewer.removeChild(this._glossaryElement);
    }
  }

  onAnnotationHintsEnabledChanged(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.handleSetAnnotationHintsEnabled(event.target.checked);
  }

  render() {
    const { pages, entities, termGlossesEnabled } = this.props;

    /*
     * The width of the primer should be the same as the width of the first page. The height of
     * the primer can be determined dynamically from its content.
     */
    const firstPage = pages[0];
    if (firstPage === undefined) {
      return null;
    }
    const { width } = firstPage.view.div.style;
    if (width === undefined) {
      return null;
    }
    this._welcomeElement.style.width = width;
    this._glossaryElement.style.width = width;

    const terms = entities !== null ? glossaryTerms(entities) : [];
    const symbols = entities !== null ? glossarySymbols(entities) : [];

    const welcomeComponent = ReactDOM.createPortal(
      <div className="welcome-page primer-page__contents">
        <p className="primer-page__header">Welcome to ScholarPhi.</p>
        <p>
          ScholarPhi is an interface that helps you understand scientific
          papers. The current version of the tool reveals definitions of
          technical terms and mathematical symbols.
        </p>
        <p>
          Below, you can try out ScholarPhi on an example paper. Get started by
          clicking on a term or symbol{" "}
          <span style={{ borderBottom: "1px dotted" }}>
            underlined with a dotted line
          </span>
          , and see what appears. Then click on buttons in the tooltips that
          appear. Then, try clicking equations and citations.
        </p>
        <p>This demo of ScholarPhi offers the following features:</p>
        <ul className="feature-list">
          <li>
            Tooltips that reveal the definitions of technical terms and symbols,
          </li>
          <li>
            Equation diagrams that reveal definitions of many symbols at once,
          </li>
          <li>
            A glossary of key terms and symbols at the top of the document,
          </li>
          <li>...and several others.</li>
        </ul>
        <p>To learn more about the project, read the ScholarPhi paper:</p>
        <p>
          Andrew Head, Kyle Lo, Dongyeop Kang, Raymond Fok, Sam Skjonsberg,
          Daniel S. Weld, and Marti A. Hearst. "
          <a href="https://arxiv.org/abs/2009.14237">
            Augmenting Scientific Papers with Just-in-Time, Position-Sensitive
            Definitions of Terms and Symbols
          </a>
          ". In:{" "}
          <i>
            Proceedings of the CHI Conference on Human Factors in Computing
            Systems
          </i>
          . 2021. (<a href="https://youtu.be/y8Kuyf9jygs">Demo video</a>).
        </p>
      </div>,
      this._welcomeElement
    );

    const glossaryComponent = ReactDOM.createPortal(
      <div className="primer-page__contents">
        {entities === null ? (
          <>
            <p className="primer-page__header">
              Building a glossary of key terms and symbols for this paper...
            </p>
            <p>Please wait... Scanning paper...</p>
            <LinearProgress />
          </>
        ) : (
          <>
            {termGlossesEnabled && terms.length > 0 ? (
              <>
                <p className="primer-page__header">Glossary of key terms</p>
                <p className="primer-page__subheader">
                  Listed in order of appearance.
                </p>
                <div className="primer-page__glossary">
                  <ul>
                    {terms
                      .filter((t) => t.attributes.term_type !== "symbol")
                      .map((t) => (
                        <li key={t.id}>
                          <TermDefinitionGloss term={t} />
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            ) : null}
            {symbols.length > 0 ? (
              <>
                <p className="primer-page__header">
                  Glossary of key {terms.length === 0 && "terms and "} symbols
                </p>
                <p className="primer-page__subheader">
                  Listed in order of appearance.
                </p>
                <div className="primer-page__glossary">
                  <ul>
                    {symbols
                      .filter(
                        (s) =>
                          s.attributes.definitions.length > 0 ||
                          s.attributes.nicknames.length > 0
                      )
                      .map((s) => (
                        <li key={s.id}>
                          <SymbolDefinitionGloss symbol={s} />
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>,
      this._glossaryElement
    );

    return (
      <>
        {welcomeComponent}
        {glossaryComponent}
      </>
    );
  }

  private _welcomeElement: HTMLDivElement;
  private _glossaryElement: HTMLDivElement;
}

/**
 * Get the first instance of each defined symbol.
 */
function glossarySymbols(entities: Entities) {
  const symbolsByTex: { [tex: string]: Symbol[] } = {};
  entities.all
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter(isSymbol)
    .filter(
      (s) =>
        s.attributes.nicknames.length > 0 || s.attributes.definitions.length > 0
    )
    .filter((s) => s.attributes.tex !== null)
    .forEach((s) => {
      const tex = s.attributes.tex as string;
      if (symbolsByTex[tex] === undefined) {
        symbolsByTex[tex] = [];
      }
      symbolsByTex[tex].push(s);
    });

  const commonSymbols = [];
  for (const tex in symbolsByTex) {
    if (symbolsByTex[tex].length > 1) {
      commonSymbols.push(symbolsByTex[tex][0]);
    }
  }

  return commonSymbols;
}

/**
 * Get the first instance of each defined term.
 */
function glossaryTerms(entities: Entities) {
  const termsByName: { [name: string]: Term } = {};
  entities.all
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter(isTerm)
    .filter((t) => t.attributes.definitions.length > 0)
    .filter((t) => t.attributes.name !== null)
    .filter((t) => (t.attributes.name as string).indexOf("SKIP") === -1)
    .filter(
      (t) =>
        t.attributes.term_type === null ||
        t.attributes.term_type.toLowerCase() !== "ignore"
    )
    .forEach((t) => {
      const name = t.attributes.name as string;
      if (termsByName[name] === undefined) {
        termsByName[name] = t;
      }
    });
  return Object.values(termsByName);
}

export default PrimerPage;
