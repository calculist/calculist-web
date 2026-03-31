const { createCalculist } = require('./helpers/calculistTestHelper');

describe('parseUntilBalanced', () => {
  let parseUntilBalanced;

  beforeAll(() => {
    const calc = createCalculist();
    parseUntilBalanced = calc.get('parseUntilBalanced');
  });

  it('parses parentheses', () => {
    expect(parseUntilBalanced('(hello)')).toBe('(hello)');
  });

  it('parses nested brackets', () => {
    expect(parseUntilBalanced('(c [d {e}])')).toBe('(c [d {e}])');
  });

  it('extracts first balanced group from text', () => {
    expect(parseUntilBalanced('ab (c [d {e}]) f (g)')).toBe('(c [d {e}])');
  });

  it('handles square brackets', () => {
    expect(parseUntilBalanced('[1 + 2]')).toBe('[1 + 2]');
  });

  it('handles curly braces', () => {
    expect(parseUntilBalanced('{a: 1}')).toBe('{a: 1}');
  });

  it('handles quoted strings', () => {
    expect(parseUntilBalanced('"hello world"')).toBe('"hello world"');
  });

  it('handles single-quoted strings', () => {
    expect(parseUntilBalanced("'hello'")).toBe("'hello'");
  });

  it('handles brackets inside strings', () => {
    expect(parseUntilBalanced('("contains (parens)")')).toBe('("contains (parens)")');
  });

  it('returns empty string for unbalanced input', () => {
    expect(parseUntilBalanced('(unclosed')).toBe('');
  });

  it('handles escaped characters', () => {
    expect(parseUntilBalanced('(a\\)b)')).toBe('(a\\)b)');
  });

  it('returns empty string for plain text with no brackets', () => {
    expect(parseUntilBalanced('hello')).toBe('');
  });
});
