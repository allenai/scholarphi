import EquationDiagramGloss from "./EquationDiagramGloss";
import { Dimensions } from "../../../types/ui";

import React from "react";

interface Props {
  /**
   * Text strings to render. Dimensions will be saved for each string.
   */
  texts: string[];
  onDimensionsComputed(dimensions: { [text: string]: Dimensions }): void;
}

/**
 * Render this component within an div to obtain the dimensions for the glosses that
 * will be rendered for a list of labels. The computed dimensions can be used to set
 * the size of glosses dynamically.
 */
class LabelRenderer extends React.PureComponent<Props> {
  /**
   * Compute the dimensions of each rendered string after the first render.
   */
  componentDidMount() {
    if (this._container === null) {
      return;
    }
    const dimensions: { [text: string]: Dimensions } = {};
    this._container.querySelectorAll(".test-render-gloss").forEach((g) => {
      if (g.id !== null) {
        const labelMatch = g.id.match(/gloss-for-label-(\d+)/);
        if (!labelMatch) {
          return;
        }
        const labelIndex = Number(labelMatch[1]);
        dimensions[this.props.texts[labelIndex]] = {
          width: g.getBoundingClientRect().width,
          height: g.getBoundingClientRect().height,
        };
      }
    });
    this.props.onDimensionsComputed(dimensions);
  }

  render() {
    return (
      <div ref={(ref) => (this._container = ref)}>
        {this.props.texts.map((t, i) => (
          <EquationDiagramGloss
            id={`gloss-for-label-${i}`}
            className="test-render-gloss"
            key={i}
            anchor={{ x: 0, y: 0 }}
          >
            {t}
          </EquationDiagramGloss>
        ))}
      </div>
    );
  }

  private _container: HTMLDivElement | null = null;
}

export default LabelRenderer;
