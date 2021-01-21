import { Entities, Pages } from "../../state";
import SymbolDefinitionGloss from "./SymbolDefinitionGloss";
import TermDefinitionGloss from "./TermDefinitionGloss";
import { isSymbol, isTerm, Symbol, Term } from "../../api/types";
import { PDFViewer } from "../../types/pdfjs-viewer";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import LinearProgress from "@material-ui/core/LinearProgress";
import Switch from "@material-ui/core/Switch";
import React from "react";
import ReactDOM from "react-dom";

interface Props {
  pdfViewer: PDFViewer;
  pages: Pages;
  entities: Entities | null;
  showInstructions: boolean;
  annotationHintsEnabled: boolean;
  termGlossesEnabled: boolean;
  scrollToPageOnLoad?: boolean;
  areCitationsLoading?: boolean;
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
    this._element = document.createElement("div");
    this._element.classList.add("primer-page");
    this.onAnnotationHintsEnabledChanged = this.onAnnotationHintsEnabledChanged.bind(
      this
    );
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

  onAnnotationHintsEnabledChanged(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.handleSetAnnotationHintsEnabled(event.target.checked);
  }

  render() {
    const {
      pages,
      entities,
      showInstructions,
      termGlossesEnabled,
      areCitationsLoading,
    } = this.props;

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

    const isEntitiesLoaded = (entities: Entities | null): entities is Entities => ( entities !== null );
    const terms = isEntitiesLoaded(entities) ? glossaryTerms(entities) : [];
    const symbols = isEntitiesLoaded(entities) ? glossarySymbols(entities) : [];

    return ReactDOM.createPortal(
      <>
        <div className="primer-page__contents">
          {showInstructions && (
            <>
              <p className="primer-page__header">This paper is interactive.</p>
              <p>
                Sometimes it can be hard to understand a paper. The citations
                can be poorly explained. Symbols can be cryptic. Terms can be
                confusing. What if your reading application helped explain these
                parts of a paper?
              </p>
              <p>
                This reading application, called <b>ScholarPhi</b>, explains
                confusing things in papers. You can click on citations, symbols,
                and terms to look up explanations of them. Anything that has a{" "}
                <span style={{ borderBottom: "1px dotted" }}>
                  dotted underline
                </span>{" "}
                can be clicked to access an explanation.
              </p>
              <p>The main features are:</p>
              <ul className="feature-list">
                <li>Click a citation to see the abstract for that citation</li>
                <li>
                  Click a symbol to see its definitions <i>and</i> search for
                  that symbol elsewhere in the paper
                </li>
                <li>
                  Click a display equation to see a diagram with definitions of
                  key symbols.
                </li>
              </ul>
              <p>
                Subsymbols of big, complex symbols can be selected by clicking
                first on the complex symbol, and then on its subsymbol. If you
                want to hide the explanations, just click anywhere on the page
                that isn't underlined.
              </p>
              <p>
                Your use of this application is entirely voluntary and you may
                exit it at any time. By using this tool, you consent to have
                your interactions with the tool logged with your IP address.
                Your interactions and responses to the form will be analyzed as
                part of on-going research conducted by post-doc{" "}
                <a href="mailto:andrewhead@berkeley.edu">Andrew Head</a> and PI{" "}
                <a href="mailto:hears@berkeley.edu">Marti Hearst</a> at UC
                Berkeley. Contact the researchers if you have any questions.
              </p>
              <p>
                If you have feedback on how to improve ScholarPhi or want to report a bug, please join our Slack channel <a href="https://join.slack.com/share/zt-kzpbfz5x-5xVGrzxORdkdNI_RIjS52A">#s2-scholarphi-users</a>.
              </p>
              <hr />
              <p className="primer-page__header">Reading settings</p>
              <div>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.props.annotationHintsEnabled}
                        color="primary"
                        onChange={this.onAnnotationHintsEnabledChanged}
                      />
                    }
                    label={
                      <>
                        Mark explainable things with a{" "}
                        <span style={{ borderBottom: "1px dotted" }}>
                          dotted underline
                        </span>{" "}
                        (recommended).
                      </>
                    }
                  />
                </FormControl>
              </div>
            </>
          )}
          {
            (areCitationsLoading || !isEntitiesLoaded(entities)) && (
              <>
                <p className="primer-page__header">
                  Preparing paper for interactive viewing...
                </p>
                {
                  areCitationsLoading && (
                    <>
                      <p>Loading citation data...</p>
                      <LinearProgress />
                    </>
                  )
                }
                {
                  !isEntitiesLoaded(entities) && (
                    <>
                      <p>Building a glossary of key terms and symbols..</p>
                      <LinearProgress />
                    </>
                  )
                }
              </>
            )
          }
          {isEntitiesLoaded(entities) && (
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
