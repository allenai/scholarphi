import { paperSelector } from './validation';

describe('paperSelector', () => {
  it('accepts valid S2 IDs', () => {
    const selector = { paperSelector: '866d17b5f7984af4f6f8e65a79c093417ad3f011' };
    const result = paperSelector.validate(selector);
    expect(result.error).toBeUndefined();
  });

  it('rejects invalid S2 IDs', () => {
    const zSelector = { paperSelector: 'zzzzzzb5f7984af4f6f8e65a79c093417ad3f011' };
    expect(paperSelector.validate(zSelector).error).toBeDefined();

    const shortSelector = { paperSelector: 'b5f7984af4f6f8e65a79c093417ad3f011' };
    expect(paperSelector.validate(shortSelector).error).toBeDefined();

    const longSelector = { paperSelector: '866d17b5f7984af4f6f8e65a79c093417ad3f0111' };
    expect(paperSelector.validate(longSelector).error).toBeDefined();
  });

  it('accepts new arXiv IDs', () => {
    const selector = { paperSelector: 'arxiv:2010.08824v1' };
    const result = paperSelector.validate(selector);
    expect(result.error).toBeUndefined();
  });

  it('accepts old arXiv IDs', () => {
    const selector = { paperSelector: 'arxiv:astro-ph/0201002v1' };
    const result = paperSelector.validate(selector);
    expect(result.error).toBeUndefined();
  });

  it('accepts old arXiv IDs with the optional bit', () => {
    const selector = { paperSelector: 'arxiv:math.GT/0008020v2' };
    const result = paperSelector.validate(selector);
    expect(result.error).toBeUndefined();
  });

  it('accepts arXiv IDs without versions', () => {
    const newSelector = { paperSelector: 'arxiv:2010.08824' };
    expect(paperSelector.validate(newSelector).error).toBeUndefined();

    const oldSelector = { paperSelector: 'arxiv:astro-ph/0201002' };
    expect(paperSelector.validate(oldSelector).error).toBeUndefined();
  });
});
