// @ts-ignore
import * as program from "commander";
import * as csv from "fast-csv";
import * as katex from "katex";
import { EquationParseResult } from "./types";

program
  .command("equations-csv <csv-file>")
  .description(
    "Parse equations from CSV file. Expected format of each row is [path], [i], [equation-tex]"
  )
  .action(csvPath => {
    csv.parseFile(csvPath).on("data", row => {
      const [path, i, equation] = row;
      const baseResult = { i, path, equation };
      let result: EquationParseResult;
      if (row.length !== 3) {
        result = {
          ...baseResult,
          success: true,
          mathMl: null,
          errorMessage:
            "FormatError: Unexpected format of CSV row. Check that parameters for writing the CSV and reading the CSV are consistent."
        };
      } else {
        try {
          const mathMl = parse(equation);
          result = { ...baseResult, success: true, mathMl, errorMessage: null };
        } catch (e) {
          result = { ...baseResult, success: false, mathMl: null, errorMessage: e.toString() };
        }
      }
      console.log(JSON.stringify(result));
    });
  });

program
  .command("equation <equation>")
  .description(
    "Parse a TeX equation. Provide equation as a string, without surrounding delimiters (e.g., '$', '\\begin{equation}', etc."
  )
  .action(equation => {
    console.log(parse(equation));
  });

program.parse(process.argv);

/**
 * Parse an equation into a MathML tree with source location annotations.
 */
function parse(equation: string): string {
  return katex.renderToString(equation, { output: "mathml", throwOnError: true });
}
