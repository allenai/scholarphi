// @ts-ignore
import * as program from "commander";
import * as csv from "fast-csv";
import * as katex from "katex";
import * as traverse from "traverse";
import { EquationParseResult, Token } from "./types";

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
          tokens: null,
          errorMessage:
            "FormatError: Unexpected format of CSV row. Check that parameters for writing the CSV and reading the CSV are consistent."
        };
      } else {
        try {
          const tokens = parse(equation);
          result = { ...baseResult, success: true, tokens, errorMessage: null };
        } catch (e) {
          result = { ...baseResult, success: false, tokens: null, errorMessage: e.toString() };
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
    const tokens = parse(equation);
    for (const token of tokens) {
      console.log(JSON.stringify(token));
    }
  });

program.parse(process.argv);

/**
 * Parse an equation and return a list of tokens and their positions.
 */
function parse(equation: string): Token[] {
  /*
   * XXX(andrewhead): Uses KaTeX internal (undocumented) functions.
   */
  const tree = katex.__parse(equation);
  const tokens = [];

  /*
   * KaTeX tree does not have a notion of 'children': children of a node can belong to properties
   * with any name. For now, we traverse all nodes of the tree by just doing a traversal of all
   * properties everywhere in the object.
   */
  traverse(tree).forEach(object => {
    /*
     * Only extract 'mathord' (i.e. non-operator symbols) for now.
     */
    if (
      object !== undefined &&
      object !== null &&
      object.type === "mathord" &&
      object.loc !== undefined
    ) {
      const token = {
        start: object.loc.start,
        end: object.loc.end,
        text: object.text
      };
      tokens.push(token);
    }
  });
  return tokens;
}
