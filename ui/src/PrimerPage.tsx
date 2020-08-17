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
      <div className="primer-page__contents">
        <p className="primer-page__header">This paper is interactive.</p>
        <p>
          Sometimes it can be hard to understand a paper. The citations can be
          poorly explained. Symbols can be cryptic. Terms can be confusing. What
          if your reading application helped explain these parts of a paper?
        </p>
        <p>
          This is a prototype tool called <i>ScholarPhi</i>. It explains
          confusing things in papers. You can click on citations, symbols, and
          terms to look up explanations of them. Anything that has an{" "}
          <u>dotted underline</u> can be clicked to access an explanation. If
          you find these underlines distracting, you can turn them off by
          clicking on "Hide Annotations" in the toolbar in the top right of the
          application.
        </p>
        <p>
          Help us improve the tool for future users by opening{" "}
          <a href="https://forms.gle/7SUx72xEaPCRb5NLA">this form</a>, and
          providing feedback as you read. There is a text field for minor
          suggestions which we suggest you fill out while reading.
        </p>
        <p>
          By using this tool, you consent to have your interactions with the
          tool logged with your IP address.
        </p>
        <hr />

        {entities === null ? (
          <>
            <p>Assembling a list of explanations...</p>
            <LinearProgress />
          </>
        ) : (
          <>
            <p>
              To start, here is an an overview of terms from this paper and
              their definitions:
            </p>
            {terms.length > 0 ? (
              <>
                <p className="primer-page__header">
                  Glossary of selected terms
                </p>
                <div className="primer-page__glossary">
                  <ul>
                    {terms.map((t) => (
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
                  Glossary of selected symbols
                </p>
                <div className="primer-page__glossary">
                  <ul>
                    {glossarySymbols(entities).map((s) => (
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
    .forEach((t) => {
      const name = t.attributes.name as string;
      if (termsByName[name] === undefined) {
        termsByName[name] = t;
      }
    });
  return Object.values(termsByName);
}

export default PrimerPage;
