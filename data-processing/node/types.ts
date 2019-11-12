export interface Token {
  index: number;
  start: number;
  end: number;
  text: string;
}

export interface EquationParseResult {
  success: boolean;
  i: number;
  path: string;
  equation: string;
  mathMl: string | null;
  errorMessage: string | null;
}
