// @ts-ignore
import * as katex from "katex";
import * as traverse from "traverse";
import { Token } from "./types";

/*
 * Assume that the equation is the last argument passed to the program.
 */
const equationArgument = process.argv[process.argv.length - 1];

/**
 * Parse an equation and return a list of tokens and their positions.
 */
function parse(equation: string): Token[] {
  /*
   * XXX(andrewhead): Uses KaTeX internal functions.
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
    if (object.type === "mathord" && object.loc !== undefined) {
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

const result = parse(equationArgument);
for (const token of result) {
  console.log(JSON.stringify(token));
}
