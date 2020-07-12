/**
 * See https://github.com/KaTeX/KaTeX/issues/1927#issuecomment-485294236 for documentation
 * from the KaTeX team on importing KaTeX in a Node environment.
 */
import Card from "@material-ui/core/Card";
import LinearProgress from "@material-ui/core/LinearProgress";
import katex from "katex";
import renderMathInElement from "katex/dist/contrib/auto-render";
import "katex/dist/katex.min.css"; // KaTeX styles necessary for styling formulas.
import React from "react";

interface Props {
  latex: string;
  handleParseError?: (message: string, error: katex.ParseError) => void;
}

/**
 * Preview of LaTeX. Only supports rendering of LaTeX formulas and no other macros. Support
 * for rendering of LaTeX formulas is limited to the support provided by KaTeX
 * (https://katex.org/).
 */
class LatexPreview extends React.PureComponent<Props> {
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
        ],
        errorCallback: (message: string, error: katex.ParseError) => {
          if (this.props.handleParseError !== undefined) {
            this.props.handleParseError(message, error);
          }
        },
      });
    }
    /*
     * Hide the progress indicator.
     */
    if (this._progressContainer !== null) {
      this._progressContainer.hidden = true;
    }
  }

  render() {
    return (
      <Card className="latex-preview">
        <div ref={(ref) => (this._latexContainer = ref)}>
          <span>
            <b>Preview</b>:&nbsp;
          </span>
          {/*
           * LaTeX has to be in an element of its own for a change in the 'latex' prop to
           * trigger a re-rendering of the component.
           */}
          <span>{this.props.latex}</span>
        </div>
        <div
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
        </div>
      </Card>
    );
  }

  private _latexContainer: HTMLElement | null = null;
  private _progressContainer: HTMLElement | null = null;
}

export default LatexPreview;
