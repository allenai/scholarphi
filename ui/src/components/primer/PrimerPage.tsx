import { Entities, Pages, PaperId } from "../../state";
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
import FeedbackLink from "../common/FeedbackLink";

import PaperQuestion from "../questions/PaperQuestionGloss";
// import PaperQuestionList from "../entity/questions/PaperQuestionList";
// import * as testQuestions from "../../../questions.json";

interface Props {
  paperId?: PaperId;
  pdfViewer: PDFViewer;
  pages: Pages;
  entities: Entities | null;
  showInstructions: boolean;
  annotationHintsEnabled: boolean;
  primerPageGlossaryEnabled: boolean;
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
      paperId,
      pages,
      entities,
      primerPageGlossaryEnabled,
      showInstructions,
      termGlossesEnabled,
      areCitationsLoading,
    } = this.props;

    // console.log(testQuestions);

    // const questions = testQuestions.map((d) => <PaperQuestion id={d.id} text={d.text}></PaperQuestion>);
    
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

    const instructions = (
      <>
        <p className="primer-page__header">Read this first!</p>
        <p>
        There is a lot of information in this paper, and some of it might not be useful to you. 
        We recommend you read this paper strategically. 
        To help out, we have highlighted some common questions that provide useful information in the paper. 
        Click on the "FAQs" in the upper left corner to see these questions.
        </p>
        <p> 
        Many of the complicated terms in the article are defined for you, especially those around highlighted sections. 
        Click on a boxed term to see a definition. 
        If a term doesn’t have a definition, the system does not think it is directly related to understanding the findings of the article.  
        </p>
        <p>
          When judging the relevance of this paper to your situation,  note that none of the treatments here are FDA approved, though some are in clinical trials. 
        </p>
        {/* <ul className="feature-list">
          <li>Citations - Click a citation to see the abstract for that citation</li>
          <li>Symbols - Click a mathematical symbol to see its usages throughout the paper</li>
        </ul> */}
        {/* <PaperQuestionList questions={ questions }></PaperQuestionList> */}
        <p>
          This reading application is based on research from the Semantic Scholar team at AI2,
          UC Berkeley and the University of Washington,
          and is supported in part by the Alfred P. Sloan Foundation.
          Learn more about Semantic Reader <a href="https://www.semanticscholar.org/product/semantic-reader">here</a>.
        </p>
        <p className={"primer-page__subheader"}>Have feedback?</p>
        <p>
          Please use this <FeedbackLink text="form" paperId={paperId} /> to submit feedback on how to help
          improve Semantic Reader or to report a bug.
        </p>
        {paperId && paperId.type === "arxiv" && (
          <p className="primer-page__smaller-text">
            By using this tool you agree to the terms outlined in our <a href="https://allenai.org/privacy-policy">Privacy Policy</a>.
            {/* View and download <a href={`https://arxiv.org/pdf/${paperId.id}.pdf`}>this PDF</a> on arXiv. */}
          </p>
        )}
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
    );

    return ReactDOM.createPortal(
      <>
        <div className="primer-page__contents">
          {showInstructions && instructions}
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
              {primerPageGlossaryEnabled && termGlossesEnabled && terms.length > 0 ? (
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
              {primerPageGlossaryEnabled && symbols.length > 0 ? (
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
