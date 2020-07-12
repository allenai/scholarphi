/**
 * Only the subset of the KaTeX module and members that are used in the code are enumerated here.
 */
declare module "katex" {
  declare class ParseError {}
}

declare module "katex/dist/contrib/auto-render" {
  import katex from "katex";

  /**
   * Automatically discover and render the LaTeX math formulas in an HTML element. A summary
   * of relevant options has been included below. See also the KaTeX documentation at
   * https://katex.org/docs/autorender.html#api.
   */
  export default function renderMathInElement(
    element: HTMLElement,
    options: RenderOptions
  );

  /**
   * Only the subset of options that used by the ScholarPhi code have been enumerated here.
   */
  interface RenderOptions {
    /**
     * Delimiters indicating what parts of the text are LaTeX formulas.
     */
    delimiters?: DelimiterSpec[];
    errorCallback?: (message: string, error: katex.ParseError) => void;
    /**
     * Callback to preprocess math LaTeX before rendering it.
     */
    preProcess?: (math: string) => string;
  }

  interface DelimiterSpec {
    /**
     * String pattern indicating the start of a formula.
     */
    left: string;
    /**
     * String pattern indicating the end of a formula.
     */
    right: string;
    /**
     * Whether these delimiters indicate that the formula should be shown as a display formula.
     */
    display: boolean;
  }
}
