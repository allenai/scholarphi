import { extractArxivId } from './ui';

describe('extractArxivId', () => {
  it('extracts the ID from an arXiv PDF url', () => {
    const url = 'https://arxiv.org/pdf/2005.06967v2.pdf';
    const output = extractArxivId(url);
    expect(output).toEqual('2005.06967v2');
  });

  it('extracts the ID from a math paper arXiv PDF url', () => {
    const url = 'https://arxiv.org/pdf/math/0008020v2.pdf';
    const output = extractArxivId(url);
    expect(output).toEqual('math/0008020v2');
  });

  it('ignores nonsense after the .pdf extension as pdf.js does', () => {
    const url = 'https://arxiv.org/pdf/2005.06967v2.pdf?showAll=true';
    const output = extractArxivId(url);
    expect(output).toEqual('2005.06967v2');
  });

  it('returns no match if no arxiv URL is given', () => {
    const url = 'this is not an arxiv url';
    const output = extractArxivId(url);
    expect(output).toEqual(undefined);
  });
});
