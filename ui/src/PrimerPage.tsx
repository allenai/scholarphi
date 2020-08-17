import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import LinearProgress from "@material-ui/core/LinearProgress";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Switch from "@material-ui/core/Switch";
import ThumbsUp from "@material-ui/icons/ThumbUpSharp";
import React from "react";
import ReactDOM from "react-dom";
import { getRemoteLogger } from "./logging";
import { GlossStyle } from "./settings";
import { Entities, Pages } from "./state";
import SymbolDefinitionGloss from "./SymbolDefinitionGloss";
import TermDefinitionGloss from "./TermDefinitionGloss";
import { isSymbol, isTerm, Symbol, Term } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";

const logger = getRemoteLogger();

interface Props {
  pdfViewer: PDFViewer;
  pages: Pages;
  entities: Entities | null;
  annotationHintsEnabled: boolean;
  glossStyle: GlossStyle;
  handleSetGlossStyle: (style: GlossStyle) => void;
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
    this.onGlossStyleChanged = this.onGlossStyleChanged.bind(this);
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

  onAnnotationHintsEnabledChanged(event: React.ChangeEvent<HTMLInputElement>) {
    logger.log("debug", "set-hints-enabled", { enabled: event.target.checked });
    this.props.handleSetAnnotationHintsEnabled(event.target.checked);
  }

  onGlossStyleChanged(event: React.ChangeEvent<HTMLInputElement>) {
    logger.log("debug", "set-gloss-style", { style: event.target.value });
    this.props.handleSetGlossStyle(
      (event.target as HTMLInputElement).value as GlossStyle
    );
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
          This reading application, called <b>ScholarPhi</b>, explains confusing
          things in papers. You can click on citations, symbols, and terms to
          look up explanations of them. Anything that has a{" "}
          <span style={{ borderBottom: "1px dotted" }}>dotted underline</span>{" "}
          can be clicked to access an explanation.
        </p>
        <p>The main features are:</p>
        <ul className="feature-list">
          <li>Click a citation to see the abstract for that citation</li>
          <li>Click a term to see a definition of that term</li>
          <li>
            Click a symbol to see its definitions <i>and</i> search for that
            symbol elsewhere in the paper
          </li>
        </ul>
        <p>
          Subsymbols of big, complex symbols can be selected by clicking first
          on the complex symbol, and then on its subsymbol. If you want to hide
          the explanations, just click anywhere on the page that isn't
          underlined.
        </p>
        <p>
          Before reading this paper, please open{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://forms.gle/7SUx72xEaPCRb5NLA"
          >
            this form
          </a>{" "}
          and take a look at it. We'd like if you could provide feedback about
          what's working in the tool as you use it, and what isn't.
        </p>
        <p>
          We also ask that you click the thumbs-up button (which looks like{" "}
          <ThumbsUp />) whenever you see a useful explanation. This helps us
          know what explanations to keep in future versions of the application.
        </p>
        <p>
          Your use of this application is entirely voluntary and you may exit it
          at any time. By using this tool, you consent to have your interactions
          with the tool logged with your IP address. Your interactions and
          responses to the form will be analyzed as part of on-going research
          conducted by post-doc{" "}
          <a href="mailto:andrewhead@berkeley.edu">Andrew Head</a> and PI{" "}
          <a href="mailto:hears@berkeley.edu">Marti Hearst</a> at UC Berkeley.
          Contact the researchers if you have any questions.
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
                  </span>
                  (recommended).
                </>
              }
            />
          </FormControl>
        </div>
        <div>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              How would you like to view explanations?
            </FormLabel>
            <RadioGroup
              defaultValue="tooltip"
              value={this.props.glossStyle}
              onChange={this.onGlossStyleChanged}
            >
              <FormControlLabel
                value="tooltip"
                control={<Radio color="primary" size="small" />}
                label="Tooltips (Recommended for laptops and small displays)"
              />
              <FormControlLabel
                value="sidenote"
                control={<Radio color="primary" size="small" />}
                label="Sidenotes (Recommended for large displays)"
              />
            </RadioGroup>
          </FormControl>
        </div>
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
                  Glossary of selected terms (by order of appearance)
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
                  Glossary of selected symbols (by order of appearance)
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
    .filter((t) => (t.attributes.name as string).indexOf("SKIP") === -1)
    .forEach((t) => {
      const name = t.attributes.name as string;
      if (termsByName[name] === undefined) {
        termsByName[name] = t;
      }
    });
  return Object.values(termsByName);
}

export default PrimerPage;
