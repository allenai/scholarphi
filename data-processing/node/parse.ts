// @ts-ignore
import * as program from "commander";
import * as csv from "fast-csv";
import * as katex from "katex";
import { EquationParseResult } from "./types";

program
  .command("equations-csv <csv-file>")
  .option(
    "-t, --throw-on-error",
    "Make KaTeX throw a parse error when it fails to parse an equation."
  )
  .option(
    "-c, --error-color <color>",
    "Hex code for color of parse error nodes in MathML."
  )
  .description(
    "Parse equations from CSV file. Should include columns for 'path', 'i', and 'content_tex'"
  )
  .action((csvPath, cmdObj) => {
    csv.parseFile(csvPath, { headers: true }).on("data", row => {
      const { tex_path, i, content_tex: equation } = row;
      const baseResult = { i, tex_path, equation };
      let result: EquationParseResult;
      if (row.length < 12) {
        result = {
          ...baseResult,
          success: false,
          mathMl: null,
          errorMessage:
            "FormatError: Unexpected format of CSV row. Check that parameters for writing the CSV and reading the CSV are consistent."
        };
      } else {
        try {
          const mathMl = parse(
            equation,
            cmdObj.throwOnError,
            cmdObj.errorColor
          );
          result = { ...baseResult, success: true, mathMl, errorMessage: null };
        } catch (e) {
          result = {
            ...baseResult,
            success: false,
            mathMl: null,
            errorMessage: e.toString()
          };
        }
      }
      console.log(JSON.stringify(result));
    });
  });

program
  .command("equation <equation>")
  .option(
    "-t, --throw-on-error",
    "Make KaTeX throw a parse error when it fails to parse an equation."
  )
  .option(
    "-c, --error-color <color>",
    "Hex code for color of parse error nodes in MathML."
  )
  .description(
    "Parse a TeX equation. Provide equation as a string, without surrounding delimiters (e.g., '$', '\\begin{equation}', etc."
  )
  .action((equation, cmdObj) => {
    console.log(parse(equation, cmdObj.throwOnError, cmdObj.errorColor));
  });

program.parse(process.argv);

/**
 * Parse an equation into a MathML tree with source location annotations.
 */
function parse(
  equation: string,
  throwOnError?: boolean,
  errorColor?: string
): string {
  return katex.renderToString(equation, {
    output: "mathml",
    throwOnError: throwOnError || false,
    errorColor
  });
}
