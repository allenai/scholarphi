import Labella from "labella";
import React from "react";
import DiagramLabel from "./DiagramLabel";
import * as selectors from "./selectors";
import { Entities } from "./state";
import SvgTextRenderer from "./SvgTextRenderer";
import { Equation } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import { Dimensions, Rectangle } from "./types/ui";
import * as uiUtils from "./utils/ui";

/**
 * A feature that is to be labeled in a diagram.
 */
interface Feature {
  id: string;
  /**
   * If this feature is related to other features, that can be expressed by setting the group
   * ID for multiple features to the same ID. This might be used, for example, to show only
   * one label for all features in a group.
   */
  groupId: string;
  /**
   * Bounding box of feature in the diagram that is being labeled.
   */
  location: Rectangle;
  /**
   * The text to appear in the label.
   */
  label: string;
}

type Side = "above" | "below";

/**
 * A specification for label to be rendered in a diagram.
 */
interface Label {
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  feature: Feature;
  where: Side;
}

interface Props {
  /**
   * PDFPageView that this diagram will be rendered on top of. Used to map bounding box
   * coordinates for symbols to absolute coordinates on the page.
   */
  pageView: PDFPageView;
  /**
   * Equation to diagram.
   */
  equation: Equation;
  /**
   * Store of entities that contains all symbols that belong to the equation.
   */
  entities: Entities;
}

interface State {
  svgTextDimensions: { [text: string]: Dimensions } | null;
}

/*
 * Figure with label overlays on top of features.
 */
class EquationDiagram extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      svgTextDimensions: null,
    };
    this.onSvgTextDimensionsComputed = this.onSvgTextDimensionsComputed.bind(
      this
    );
  }

  onSvgTextDimensionsComputed(dimensions: { [text: string]: Dimensions }) {
    this.setState({ svgTextDimensions: dimensions });
  }

  render() {
    const { equation, entities, pageView } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);
    const {
      width: pageWidth,
      height: pageHeight,
    } = uiUtils.getPageViewDimensions(pageView);

    /*
     * Derive a set of features that should be labeled in the diagram from symbol data.
     */
    const equationBox = selectors.outerBoundingBox(equation, pageNumber);
    if (equationBox === null) {
      return null;
    }
    const drawingArea: Rectangle = {
      left: equationBox.left * pageWidth,
      top: equationBox.top * pageHeight,
      width: equationBox.width * pageWidth,
      height: equationBox.height * pageHeight,
    };

    const features = selectors
      .equationSymbols(equation.id, entities)
      .filter(
        (s) =>
          selectors.outerBoundingBox(s, pageNumber) !== null &&
          selectors.nickname(s) !== null &&
          s.attributes.tex !== null
      )
      .map((s) => {
        const box = selectors.outerBoundingBox(s, pageNumber) as Rectangle;
        const left = box.left * pageWidth;
        const top = box.top * pageHeight;
        const width = box.width * pageWidth;
        const height = box.height * pageHeight;
        return {
          id: s.id,
          groupId: s.attributes.tex as string,
          location: { left, top, width, height },
          label: selectors.nickname(s) as string,
        } as Feature;
      });

    /*
     * First, render just the text elements to get their widths. These widths are needed in order
     * to dynamically layout the elements.
     */
    const { svgTextDimensions } = this.state;
    if (svgTextDimensions === null) {
      return (
        <svg>
          <SvgTextRenderer
            textClassName="equation-diagram__label__text"
            texts={features.map((f) => f.label)}
            onTextDimensionsComputed={this.onSvgTextDimensionsComputed}
          />
        </svg>
      );
    }

    /*
     * Filter features to label only the first feature in each group. This can be used, for
     * instance, to only label a symbol the first time it appears in an equation.
     */
    const filtered = [];
    const isGroupIncluded: { [groupId: string]: boolean } = {};
    for (const feature of features) {
      if (
        feature.groupId !== undefined &&
        isGroupIncluded[feature.groupId] !== true
      ) {
        filtered.push(feature);
        isGroupIncluded[feature.groupId] = true;
      }
    }

    /*
     * Split features into two groups: those that will have labels that appear above the figure,
     * and those that will have labels that appear below the figure.
     */
    const featureGroups = splitFeatures(filtered, svgTextDimensions);
    const topFeatures = featureGroups.first;
    const bottomFeatures = featureGroups.second;

    const BOUNDARY_MARGIN = 30;
    const LABEL_PADDING = 6;
    const topLabels = createLabels(
      topFeatures,
      svgTextDimensions,
      drawingArea,
      "above",
      BOUNDARY_MARGIN,
      LABEL_PADDING
    );
    const bottomLabels = createLabels(
      bottomFeatures,
      svgTextDimensions,
      drawingArea,
      "below",
      BOUNDARY_MARGIN,
      LABEL_PADDING
    );

    /*
     * Size the SVG canvas dynamically so that all labels will be showing.
     */
    const labels = [...topLabels, ...bottomLabels];
    const left = Math.min(0, ...labels.map((l) => l.left));
    const right = Math.max(
      drawingArea.width,
      ...labels.map((l) => l.left + l.width)
    );
    const top = Math.min(0, ...labels.map((l) => l.top));
    const bottom = Math.max(
      drawingArea.height,
      ...labels.map((l) => l.top + l.height + 4)
    );
    const width = right - left;
    const height = bottom - top;

    const FEATURE_MARGIN = 6;

    return (
      <svg
        style={{ position: "absolute", left, top }}
        className="equation-diagram"
        viewBox={`${left} ${top} ${width} ${height}`}
        width={width}
        height={height}
      >
        {labels.map((l) => (
          <g key={l.feature.id} className="equation-diagram__labeled-feature">
            <rect
              className="equation-diagram__feature"
              x={l.feature.location.left}
              y={l.feature.location.top}
              width={l.feature.location.width}
              height={l.feature.location.height}
            />
            <DiagramLabel
              textClassname="equation-diagram__label__text"
              x={l.left}
              y={l.top}
              width={l.width}
              height={l.height}
              text={l.text}
            />
            <g className="equation-diagram__leader">
              <path
                className="leader-background"
                d={createLeader(l, FEATURE_MARGIN)}
              />
              <path
                className="leader-foreground"
                d={createLeader(l, FEATURE_MARGIN)}
              />
            </g>
          </g>
        ))}
      </svg>
    );
  }
}

/**
 * Split labels into two lists of roughly equal total width. The first list's labels will all be
 * above the labels in the second list.
 */
function splitFeatures(
  features: Feature[],
  textDimensions: { [text: string]: Dimensions }
) {
  const totalWidth = features.reduce((width, f) => {
    return width + textDimensions[f.label].width;
  }, 0);
  /*
   * Sort labels from those that refer to features the highest up in the diagram to those the
   * lowest down in the diagram.
   */
  const sorted = [...features].sort(
    (f1, f2) => f1.location.top - f2.location.top
  );
  let sumWidth = 0;
  let splitIndex = 0;
  for (let i = 0; i < sorted.length; i++) {
    sumWidth += textDimensions[sorted[i].label].width;
    if (sumWidth > totalWidth / 2) {
      splitIndex = i;
      break;
    }
  }
  return {
    first: sorted.slice(0, splitIndex),
    second: sorted.slice(splitIndex, features.length),
  };
}

function createLabels(
  features: Feature[],
  textDimensions: { [text: string]: Dimensions },
  drawingArea: Rectangle,
  where: Side,
  boundaryMargin?: number | undefined,
  labelPadding?: number | undefined
): Label[] {
  /*
   * All labels share the same height, which is the height of the tallest label.
   */
  const labelHeight =
    Math.max(...Object.values(textDimensions).map((d) => d.height)) +
    (labelPadding || 0) * 2;

  /*
   * Horizontally position the nodes using Labella.js' force-directed layout algorithm. Set
   * algorithm to 'none' to disable the use of multiple layers, because:
   * * multiple layers might decrease readability of labels
   * * only a very simple algorithm is used to generate L-shaped leader lines elsewhere in the code.
   *   This algorithm does not support routing leaders around other labels.
   *
   * Unlike in the Labella.js examples, the Renderer class is not used in this code, because the
   * renderer only supports Bezier leader lines, and assumes that labels should be positioned
   * vertically relative to a heightless timeline. That said, the 'Force' helper is still useful
   * for horizontally positioning labels, before using custom code for leader lines and vertically
   * positioning the labels.
   */
  const nodes = features.map((feature) => {
    const idealX = feature.location.left + feature.location.width / 2;
    const labelWidth =
      textDimensions[feature.label].width + (labelPadding || 0) * 2;
    return new Labella.Node(idealX, labelWidth, { feature });
  });
  const force = new Labella.Force({
    algorithm: "none",
    nodeSpacing: 8,
    minPos: null,
  });
  force.nodes(nodes).compute();

  boundaryMargin = boundaryMargin || 0;
  const y =
    where === "above"
      ? drawingArea.top - boundaryMargin - labelHeight
      : drawingArea.top + drawingArea.height + boundaryMargin;

  return nodes.map((n) => ({
    /*
     * The node returned by 'Force' sets 'currentPos' to the center of the label.
     * Get the left side of the label by subtracting half the label width.
     */
    left: n.currentPos - n.width / 2,
    top: y,
    width: n.width,
    height: labelHeight,
    feature: n.data.feature,
    text: n.data.feature.label,
    where: where,
  }));
}

/**
 * Generate L-shaped leaders, which seem to have a good balance between usability and
 * likability. For a review of the terms used in this function, and of the justification for
 * using L-shaped leaders, see Barth et al.,
 * "On the readability of leaders in boundary labeling", 2019.
 */
function createLeader(label: Label, featureMargin?: number) {
  const feature = label.feature.location;
  const { where } = label;

  featureMargin = featureMargin || 0;

  /*
   * The leader leaves the label from .
   */
  const featureCenterX = feature.left + feature.width / 2;
  const PORT_PADDING = 2;

  let portX;
  if (
    featureCenterX > label.left &&
    featureCenterX < label.left + label.width
  ) {
    portX = feature.left + feature.width / 2;
  } else if (feature.left > label.left + label.width) {
    portX = label.left + label.width - PORT_PADDING;
  } else {
    portX = label.left + PORT_PADDING;
  }
  const port = {
    x: portX,
    y: where === "above" ? label.top + label.height : label.top,
  };

  /*
   * The leader connects to the feature at a site. The site is chosen in a way
   * that the leader will not pass through the feature. If possible, the leader will be purely
   * vertical; otherwise, if the label doesn't align with the feature, the label will connect
   * on the side of the feature.
   */
  let site;
  if (port.x < feature.left) {
    site = {
      x: feature.left - featureMargin,
      y: feature.top + feature.height / 2,
      side: "left",
    };
  } else if (port.x > feature.left + feature.width) {
    site = {
      x: feature.left + feature.width + featureMargin,
      y: feature.top + feature.height / 2,
      side: "right",
    };
  } else if (where === "above") {
    site = {
      x: feature.left + feature.width / 2,
      y: feature.top - featureMargin,
      side: "top",
    };
  } else {
    site = {
      x: feature.left + feature.width / 2,
      y: feature.top + feature.height + featureMargin,
      side: "bottom",
    };
  }

  /*
   * The leader extends vertically from the label and, if it is not aligned horizontally
   * with the feature, makes an L-shaped bend at the y-position of the feature.
   */
  let midpoint = { x: port.x, y: site.y };

  /*
   * Add an edge to the leader line covering the entire side of the feature on which the leader
   * line connects.
   */
  let featureEdge;
  if (site.side === "left" || site.side === "right") {
    featureEdge = [
      { x: site.x, y: feature.top },
      { x: site.x, y: feature.top + feature.height },
    ];
  } else {
    featureEdge = [
      { x: feature.left, y: site.y },
      { x: feature.left + feature.width, y: site.y },
    ];
  }

  /*
   * Path is expressed in SVG path coordinates:
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
   */
  return (
    `M ${port.x}, ${port.y} ` +
    `L ${midpoint.x}, ${midpoint.y} ` +
    `L ${site.x}, ${site.y} ` +
    featureEdge.map((p) => `L ${p.x}, ${p.y}`)
  );
}

export default EquationDiagram;
