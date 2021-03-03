/**
 * See https://github.com/KaTeX/KaTeX/issues/1927#issuecomment-485294236 for documentation
 * from the KaTeX team on importing KaTeX in a Node environment.
 */

import LinearProgress from "@material-ui/core/LinearProgress";
import katex, { TrustContext } from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render";
import "katex/dist/katex.min.css"; // KaTeX styles necessary for styling formulas.
import React from "react";

interface Props {
  /**
   * Text to render is passed in as a child. Should be either a string or a single span.
   */
  children: React.ReactNode;
  onRendered?: () => void;
  handleParseError?: (message: string, error: katex.ParseError) => void;
}

/**
 * Preview of LaTeX. Only supports rendering of LaTeX formulas and no other macros. Support
 * for rendering of LaTeX formulas is limited to the support provided by KaTeX
 * (https://katex.org/).
 */
export class LatexPreview extends React.PureComponent<Props> {
  componentDidMount() {
    this.renderLatex();
  }

  componentDidUpdate() {
    this.renderLatex();
  }

  renderLatex() {
    if (this._latexContainer !== null) {
      /*
       * If another operation depends on rendering to finish, it just needs to happen
       * after this call to 'renderMathInElement', as it looks like the function is synchronous.
       * See the implementation at
       * https://github.com/KaTeX/KaTeX/blob/master/contrib/auto-render/auto-render.js.
       */
      renderMathInElement(this._latexContainer, {
        delimiters: [
          /*
           * Double-dollar signs need to be defined before single dollar signs as otherwise
           * KaTeX will process '$$' as one left '$' and one right '$'.
           */
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\begin{align}", right: "\\end{align}", display: true },
          {
            left: "\\begin{equation}",
            right: "\\end{equation}",
            display: true,
          },
        ],
        preProcess: (math: string) => {
          return (
            math
              /*
               * Replace ampersands, which frequently appear in 'align' environments but which
               * KaTeX doesn't know how to parse.
               */
              .replace(/&/g, " ")
              /*
               * Remove macros like labels that KaTeX doesn't know how to parse.
               */
              .replace(/\\label\{[^}]+\}/g, "")
              .replace(/\\vspace\{[^}]+\}/g, "")
          );
        },
        errorCallback: (message: string, error: katex.ParseError) => {
          if (this.props.handleParseError !== undefined) {
            this.props.handleParseError(message, error);
          }
        },
        macros: {
          /*
           * When using colorbox inside a math environment, the second argument must be in
           * LaTeX delimiters. See:
           * https://github.com/KaTeX/KaTeX/issues/2300
           */
          "\\hl": "\\colorbox{yellow}{$#1$}",
          /*
           * Remove macros that KaTeX doesn't know how to parse.
           */
          "\\mathds": "",
          "\\nonumber": "",
          /*
           * TODO(andrewhead): The following macros are specific to a Neurips 2017 paper. They
           * should be removed in the future when 1703.06114 is no longer being used as a demo paper.
           */
          "\\Bcal": "\\mathcal{B}",
          "\\Dcal": "\\mathcal{D}",
          "\\Scal": "\\mathcal{S}",
          "\\Qcal": "\\mathcal{Q}",
          "\\Tcal": "\\mathcal{T}",
          "\\Fcal": "\\mathcal{F}",
          "\\Pcal": "\\mathcal{P}",
          "\\Ccal": "\\mathcal{C}",
          "\\Ocal": "\\mathcal{O}",
          "\\Xcal": "\\mathcal{X}",
          "\\Mcal": "\\mathcal{M}",
          "\\Ical": "\\mathcal{I}",
          "\\Jcal": "\\mathcal{J}",
          "\\Ycal": "\\mathcal{Y}",
          "\\Gcal": "\\mathcal{G}",
          "\\Zcal": "\\mathcal{Z}",
          "\\Ncal": "\\mathcal{N}",
          "\\Ucal": "\\mathcal{U}",
          "\\Ecal": "\\mathcal{E}",
          "\\Hcal": "\\mathcal{H}",
          "\\inner": "\\left\\langle #1,#2 \\right\\rangle",
          "\\rbr": "\\left(#1\\right)",
          "\\sbr": "\\left[#1\\right]",
          "\\cbr": "\\left\\{#1\\right\\}",
          "\\nbr": "\\left\\|#1\\right\\|",
          "\\abr": "\\left|#1\\right|",
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
        },
        trust: (context: TrustContext) => {
          const PERMITTED_CLASSES = ["match-highlight"];
          if (context.command === "\\htmlClass") {
            return PERMITTED_CLASSES.indexOf(context.class) !== -1;
          }
          return false;
        },
      });
    }
    /*
     * Hide the progress indicator.
     */
    if (this._progressContainer !== null) {
      this._progressContainer.hidden = true;
    }
    if (this.props.onRendered) {
      this.props.onRendered();
    }
  }

  render() {
    return (
      <span>
        {/*
         * LaTeX has to be in an element of its own for a change in the 'latex' prop to
         * trigger a re-rendering of the component.
         */}
        <span ref={(ref) => (this._latexContainer = ref)}>
          {this.props.children}
        </span>
        <span
          /**
           * The LinearProgress will be hidden as soon as the LaTeX renders
           * in the 'componentDidMount' and 'componentDidUpdate' hooks. But the
           * LinearProgress needs to be shown again whenever the LaTeX changes
           * until it finishes re-rendering. To show LinearProgress again, the 'key' on the
           * LinearProgress container is set to 'Date.now()', ensuring that the LinearProgress
           * element will be shown again every time the properties change.
           */
          key={Date.now()}
          ref={(ref) => (this._progressContainer = ref)}
        >
          <LinearProgress />
        </span>
      </span>
    );
  }

  private _latexContainer: HTMLElement | null = null;
  private _progressContainer: HTMLElement | null = null;
}
