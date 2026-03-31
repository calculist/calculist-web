const { createCalculist } = require('./helpers/calculistTestHelper');

describe('parseItemText', () => {
  let parseItemText;

  beforeAll(() => {
    const calc = createCalculist();
    parseItemText = calc.get('parseItemText');
  });

  describe('plain text (no separator)', () => {
    it('returns text as key with no val', () => {
      const result = parseItemText('hello world');
      expect(result.text).toBe('hello world');
      expect(result.key).toBe('hello world');
      expect(result.val).toBeNull();
      expect(result.separator).toBeNull();
    });

    it('handles empty string', () => {
      const result = parseItemText('');
      expect(result.key).toBe('');
      expect(result.val).toBeNull();
    });
  });

  describe('\\: separator (static value)', () => {
    it('parses key-value pair', () => {
      const result = parseItemText('name \\: Dan');
      expect(result.key).toBe('name');
      expect(result.val).toBe(' Dan');
      expect(result.separator).toBe('\\:');
    });

    it('parses numeric value', () => {
      const result = parseItemText('count \\: 42');
      expect(result.key).toBe('count');
      expect(result.val).toBe(' 42');
      expect(result.separator).toBe('\\:');
    });

    it('handles empty value', () => {
      const result = parseItemText('key \\:');
      expect(result.key).toBe('key');
      expect(result.val).toBe('');
      expect(result.separator).toBe('\\:');
    });
  });

  describe('\\= separator (computed value)', () => {
    it('parses expression', () => {
      const result = parseItemText('total \\= 1 + 2');
      expect(result.key).toBe('total');
      expect(result.val).toBe(' 1 + 2');
      expect(result.separator).toBe('\\=');
    });

    it('parses complex expression', () => {
      const result = parseItemText('result \\= sum($items)');
      expect(result.key).toBe('result');
      expect(result.val).toBe(' sum($items)');
      expect(result.separator).toBe('\\=');
    });
  });

  describe('\\( separator (function definition)', () => {
    it('parses function', () => {
      const result = parseItemText('add \\(a, b) = a + b');
      expect(result.key).toBe('add');
      expect(result.separator).toBe('\\(');
      expect(result.val).toContain('a, b');
    });
  });

  describe('deprecated separators', () => {
    it('parses [:] separator', () => {
      const result = parseItemText('name [:] Dan');
      expect(result.key).toBe('name');
      expect(result.separator).toBe('[:]');
    });

    it('parses [=] separator', () => {
      const result = parseItemText('total [=] 1 + 2');
      expect(result.key).toBe('total');
      expect(result.separator).toBe('[=]');
    });
  });

  describe('embedded computed strings', () => {
    it('parses \\^=[...] syntax', () => {
      const result = parseItemText('hello \\^=[1 + 1] world');
      expect(result.separator).toBe('\\=');
      expect(result.val).toContain('__embedString');
    });
  });

  describe('separator priority', () => {
    it('prefers \\( over \\= and \\:', () => {
      // \\( comes first in the separator list
      const result = parseItemText('fn \\(x) = x \\: 2');
      expect(result.separator).toBe('\\(');
    });

    it('prefers \\= over \\:', () => {
      const result = parseItemText('a \\= b \\: c');
      expect(result.separator).toBe('\\=');
    });
  });
});
