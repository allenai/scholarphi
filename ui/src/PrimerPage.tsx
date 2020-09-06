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
  scrollToPageOnLoad?: boolean;
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
    this._element = document.createElement("div");
    this._element.classList.add("primer-page");
  }

  componentDidMount() {
    const { viewer } = this.props.pdfViewer;
    if (viewer.children.length === 0) {
      viewer.appendChild(this._element);
    } else {
      viewer.insertBefore(this._element, viewer.children[0]);
    }
    if (this.props.scrollToPageOnLoad) {
      this.props.pdfViewer.container.scrollTop = 0;
    }
  }

  componentWillUnmount() {
    const { viewer } = this.props.pdfViewer;
    if (document.body.contains(viewer) && viewer.contains(this._element)) {
      viewer.removeChild(this._element);
    }
  }

  render() {
    const { pages, entities } = this.props;

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
    this._element.style.width = width;

    const terms = entities !== null ? glossaryTerms(entities) : [];
    const symbols = entities !== null ? glossarySymbols(entities) : [];

    return ReactDOM.createPortal(
      <>
        <div className="primer-page__contents">
          {entities === null ? (
            <>
              <p className="primer-page__header">
                Building a priming glossary of key terms and symbols for this
                paper...
              </p>
              <p>Please wait... Scanning paper to assemble glossary...</p>
              <LinearProgress />
            </>
          ) : (
            <>
              {terms.length > 0 ? (
                <>
                  <p className="primer-page__header">
                    Glossary of key terms (in order of appearance)
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
                    (in order of appearance)
                  </p>
                  <div className="primer-page__glossary">
                    <ul>
                      {glossarySymbols(entities)
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
        </div>
      </>,
      this._element
    );
  }

  private _element: HTMLDivElement;
}

/**
 * Get the first instance of each defined symbol.
 */
function glossarySymbols(entities: Entities) {
  const symbolsByTex: { [tex: string]: Symbol } = {};
  entities.all
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter(isSymbol)
    .filter(
      (s) =>
        s.attributes.nicknames.length > 0 ||
        s.attributes.definitions.length > 0 ||
        s.attributes.defining_formulas.length > 0
    )
    .filter((s) => s.attributes.tex !== null)
    .forEach((s) => {
      const tex = s.attributes.tex as string;
      if (symbolsByTex[tex] === undefined) {
        symbolsByTex[tex] = s;
      }
    });
  return Object.values(symbolsByTex);
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
