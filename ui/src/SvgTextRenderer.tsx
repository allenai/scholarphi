import React from "react";
import { Dimensions } from "./types/ui";

interface Props {
  /**
   * Class name to assign to each of the text elements. It's important that this class name matches
   * the class name of the text that will be rendered later, so that the dimensions of the text has
   * a matching right font size, style, and family.
   */
  textClassName?: string;
  /**
   * Text strings to render. Dimensions will be saved for each string.
   */
  texts: string[];
  onTextDimensionsComputed(widts: { [text: string]: Dimensions }): void;
}

/**
 * Render this component within an SVG to obtain the dimensions for a set of text strings.
 * The computed dimensions can be used to set the size of text elements dynamically.
 */
class SvgTextRenderer extends React.PureComponent<Props> {
  /**
   * Compute the dimensions of each rendered string after the first render.
   */
  componentDidMount() {
    if (this._gElement === null) {
      return;
    }
    const dimensions: { [text: string]: Dimensions } = {};
    this._gElement.querySelectorAll("text").forEach((t) => {
      if (t.textContent !== null) {
        dimensions[t.textContent] = {
          width: t.getBoundingClientRect().width,
          height: t.getBoundingClientRect().height,
        };
      }
    });
    this.props.onTextDimensionsComputed(dimensions);
  }

  render() {
    return (
      <g ref={(ref) => (this._gElement = ref)}>
        {this.props.texts.map((t, i) => (
          <text className={this.props.textClassName} key={i}>
            {t}
          </text>
        ))}
      </g>
    );
  }

  private _gElement: SVGGElement | null = null;
}

export default SvgTextRenderer;
