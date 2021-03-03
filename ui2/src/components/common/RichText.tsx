import katex from "katex";
import React from "react";
import { FormattedText } from "./FormattedText";
import { LatexPreview } from "./LatexPreview";

interface Props {
  children: string;
  onRendered?: () => void;
  handleLatexParseError?: (message: string, error: katex.ParseError) => void;
}

/**
 * Renderer or rich text. Formats rich text tags and a subset of LaTeX for equations.
 */
export class RichText extends React.PureComponent<Props> {
  render() {
    return this.props.children === null ? null : (
      <LatexPreview
        onRendered={this.props.onRendered}
        handleParseError={this.props.handleLatexParseError}
      >
        <FormattedText>{this.props.children}</FormattedText>
      </LatexPreview>
    );
  }
}
