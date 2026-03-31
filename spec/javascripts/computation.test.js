const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');

describe('Computation system', () => {
  let calc, itemsByGuid;

  beforeAll(() => {
    calc = createCalculist();
    itemsByGuid = calc.get('itemsByGuid');
  });

  beforeEach(() => {
    Object.keys(itemsByGuid).forEach(k => delete itemsByGuid[k]);
  });

  describe('valueOf with \\: (static values)', () => {
    it('returns numeric value', () => {
      const item = createItemTree(calc, { text: 'count \\: 42' });
      expect(item.valueOf()).toBe(42);
    });

    it('returns string value for non-numeric', () => {
      const item = createItemTree(calc, { text: 'name \\: hello' });
      expect(item.valueOf()).toBe('hello');
    });

    it('coerces numeric strings to numbers', () => {
      const item = createItemTree(calc, { text: 'x \\: 3.14' });
      expect(item.valueOf()).toBe(3.14);
    });

    it('trims whitespace from value', () => {
      const item = createItemTree(calc, { text: 'x \\:   hello   ' });
      expect(item.valueOf()).toBe('hello');
    });
  });

  describe('valueOf with \\= (computed values)', () => {
    it('evaluates arithmetic', () => {
      const item = createItemTree(calc, { text: 'total \\= 1 + 2' });
      expect(item.valueOf()).toBe(3);
    });

    it('evaluates multiplication', () => {
      const item = createItemTree(calc, { text: 'result \\= 6 * 7' });
      expect(item.valueOf()).toBe(42);
    });

    it('evaluates parenthesized expressions', () => {
      const item = createItemTree(calc, { text: 'result \\= (2 + 3) * 4' });
      expect(item.valueOf()).toBe(20);
    });

    it('returns NaN for undefined variables', () => {
      const item = createItemTree(calc, { text: 'result \\= nonexistent' });
      expect(item.valueOf()).toBeNaN();
    });
  });

  describe('variable resolution (findVar)', () => {
    it('resolves sibling variables', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\: 10' },
          { text: 'y \\= x + 5' },
        ],
      });
      expect(root.items[1].valueOf()).toBe(15);
    });

    it('resolves variables from earlier siblings only', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'result \\= x + 1' },
          { text: 'x \\: 10' },
        ],
      });
      // x is defined after result, so it should not resolve
      expect(root.items[0].valueOf()).toBeNaN();
    });

    it('resolves parent key as variable', () => {
      const root = createItemTree(calc, {
        text: 'multiplier \\: 3',
        items: [
          { text: 'result \\= multiplier * 2' },
        ],
      });
      expect(root.items[0].valueOf()).toBe(6);
    });

    it('resolves ancestor variables', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\: 7' },
          {
            text: 'section',
            items: [{ text: 'y \\= x * 2' }],
          },
        ],
      });
      expect(root.items[1].items[0].valueOf()).toBe(14);
    });
  });

  describe('plain text items', () => {
    it('valueOf returns the text itself', () => {
      const item = createItemTree(calc, { text: 'just text' });
      expect(item.valueOf()).toBe('just text');
    });

    it('key equals text for plain items', () => {
      const item = createItemTree(calc, { text: 'my key' });
      item.valueOf();
      expect(item.key).toBe('my key');
    });
  });

  describe('parsed text properties', () => {
    it('sets key and val for \\: items', () => {
      const item = createItemTree(calc, { text: 'price \\: 9.99' });
      item.valueOf();
      expect(item.key).toBe('price');
      expect(item.hasVal).toBe(true);
    });

    it('sets valIsComputed for \\= items', () => {
      const item = createItemTree(calc, { text: 'total \\= 1 + 1' });
      item.valueOf();
      expect(item.valIsComputed).toBe(true);
    });

    it('does not set valIsComputed for \\: items', () => {
      const item = createItemTree(calc, { text: 'x \\: 5' });
      item.valueOf();
      expect(item.valIsComputed).toBe(false);
    });
  });

  describe('error handling', () => {
    it('returns NaN for infinite loops', () => {
      // An item referencing itself should not hang
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\= x' },
        ],
      });
      expect(root.items[0].valueOf()).toBeNaN();
    });

    it('returns NaN for syntax errors in expressions', () => {
      const item = createItemTree(calc, { text: 'bad \\= +++' });
      expect(item.valueOf()).toBeNaN();
    });
  });
});
