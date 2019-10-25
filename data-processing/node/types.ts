export interface Token {
  start: number;
  end: number;
  text: string;
}

export interface EquationParseResult {
  success: boolean;
  i: number;
  path: string;
  equation: string;
  tokens: Token[] | null;
  errorMessage: string | null;
}
