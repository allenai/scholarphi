import { Drawer } from "antd";
import { PDFPageViewport } from "pdfjs-dist";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { PDFPageView } from "../public/pdf.js/web/pdf_page_view";
import { Summary } from "./semanticScholar";

/**
 * Dimensions are expressed in PDF coordinates, not in viewport coordinates.
 */
interface CitationAnnotationProps {
  x: number;
  y: number;
  width: number;
  height: number;
  paperSummary?: Summary;
  canvas?: HTMLCanvasElement;
  page: PDFPageView;
  /**
   * Used to convert PDF coordinates to viewport coordinates.
   */
  pageViewport: PDFPageViewport;
}

export function CitationAnnotation(props: CitationAnnotationProps) {
  const [visible, setVisible] = useState(false);

  function show() {
    setVisible(true);
    console.log("show");
  }

  function hide() {
    setVisible(false);
    console.log("hide");
  }

  if (!isXValid(props.x) || !isYValid(props.y)) {
    return null;
  }
  const pdfCoordinates = [props.x, props.y, props.x + props.width, props.y + props.height];
  const [
    viewportLeft,
    viewportBottom,
    viewportRight,
    viewportTop
  ] = props.pageViewport.convertToViewportRectangle(pdfCoordinates);
  /**
   * XXX(andrewhead): No idea why I need to flip the transformed coordinates vertically. This may
   * be related to how scale and other viewport properties get initialized. Look to how pdf-react
   * transforms PDF coordinates to viewport coordinates here:
   * https://github.com/wojtekmaj/react-pdf/blob/73f505eca1bf1ae243a2b7068fce1e86b98b408a/src/Page/AnnotationLayer.jsx#L104
   */
  const style = {
    left: viewportLeft,
    bottom: viewportTop,
    width: viewportRight - viewportLeft,
    height: viewportBottom - viewportTop,
    border: "1px solid black",
    position: "absolute" as "absolute"
  };

  if (props.canvas !== undefined) {
    const context = props.canvas.getContext("2d");
    const outputScale = props.page.outputScale;
    const x = style.left * outputScale.sx;
    let y = -1;
    if (props.canvas !== undefined) {
      y = props.canvas.height - viewportTop * outputScale.sy;
    }
    const w = (viewportRight - viewportLeft) * outputScale.sx;
    const h = (viewportTop - viewportBottom) * outputScale.sy;
    if (context !== null) {
      context.fillStyle = "#00FF00";
      context.fillRect(x, y, w, h);
    }
  }

  /*
  props.page.div.appendChild(
    $("<div></div>")
      .addClass("citation-annotation")
      .css("left", style.left)
      .css("bottom", style.bottom)
      .css("width", style.width)
      .css("position", "absolute")
      .css("border", "1px black solid")
      .css("height", style.height)
      .click(show)
      .hover(function() {
        $(this)
          .css("background-color", "blue")
          .css("opacity", 0.3);
      })[0]
  );
  */

  return ReactDOM.createPortal(
    /*
    <SummaryTooltip title={
      <React.Fragment>
        <SummaryView summary={props.paperSummary}/>
      </React.Fragment>
    }>
    */
    <div>
      <div className="citation-annotation" style={style} onClick={show} />
      <Drawer
        title="Side Glossary"
        placement="right"
        closable={true}
        onClose={hide}
        visible={visible}
      >
        <p>Explanations, explanations...</p>
      </Drawer>
    </div>,
    document.querySelectorAll(".page")[props.page.pdfPage.pageIndex]
    /*
    </SummaryTooltip>
    */
  );
}

/**
 * Grobid, the PDF analyzer that may be used here to provide annotations, sometimes assignes tokens
 * an 'x' and 'y' of -1. These positions cannot be plotted.
 */
function isXValid(x: number) {
  return x !== -1;
}

function isYValid(y: number) {
  return y !== -1;
}
