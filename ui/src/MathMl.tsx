import createDOMPurify from "dompurify";
import { browserAdaptor } from "mathjax-full/js/adaptors/browserAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";
import { MathML as MathJaxMathML } from "mathjax-full/js/input/mathml";
import { mathjax as MathJax } from "mathjax-full/js/mathjax";
import { CHTML } from "mathjax-full/js/output/chtml";
import React from "react";

interface MathMlProps {
  /**
   * This MathML will be sanitized by DOMPurify before being rendered.
   */
  mathMl: string;
}

export class MathMl extends React.Component<MathMlProps, {}> {
  async componentDidMount() {
    if (this.element !== null) {
      typesetElement(this.element);
    }
  }

  render() {
    const mathMl = `<math>${this.props.mathMl}</math>`;
    const mathMlSantized = DOMPurify.sanitize(mathMl);
    return (
      <div
        ref={ref => {
          this.element = ref;
        }}
        /*
         * Sanitize the MathML, as we're not currently 100% sure there won't be weird MathML
         * from the server, as we rely on KaTeX to produce the MathML.
         */
        dangerouslySetInnerHTML={{ __html: mathMlSantized }}
      />
    );
  }

  private element: HTMLDivElement | null = null;
}

const DOMPurify = createDOMPurify();

const adaptor = browserAdaptor();
RegisterHTMLHandler(adaptor);

const INPUT_JAX = new MathJaxMathML();
const OUTPUT_JAX = new CHTML();
const MATHJAX_OPTIONS = {
  InputJax: INPUT_JAX,
  OutputJax: OUTPUT_JAX
};
const mathJaxDocument = MathJax.document(document, MATHJAX_OPTIONS);

let typesetPromise = new Promise(resolve => {
  resolve();
});

/**
 * Typeset an element that contains MathJax. Call this function instead of the 'typeset' method
 * on 'mathJaxDocument'. There is only one 'mathJaxDocument' for the entire program, and calling
 * 'typeset' or 'clear' in the middle while another caller is calling the same methods could
 * change the results of typesetting mid-computation.
 */
async function typesetElement(element: HTMLElement) {
  typesetPromise = typesetPromise.then(() => {
    mathJaxDocument
      .findMath({ elements: [element] })
      .compile()
      .getMetrics()
      .typeset()
      .updateDocument()
      .clear();
  });
}

export default MathMl;
