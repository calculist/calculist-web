const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');

describe('Advanced computation', () => {
  let calc, itemsByGuid;

  beforeAll(() => {
    calc = createCalculist();
    itemsByGuid = calc.get('itemsByGuid');
  });

  beforeEach(() => {
    Object.keys(itemsByGuid).forEach(k => delete itemsByGuid[k]);
  });

  describe('static values (\\:)', () => {
    it('handles negative numbers', () => {
      const item = createItemTree(calc, { text: 'x \\: -5' });
      expect(item.valueOf()).toBe(-5);
    });

    it('handles floating point', () => {
      const item = createItemTree(calc, { text: 'pi \\: 3.14159' });
      expect(item.valueOf()).toBeCloseTo(3.14159);
    });

    it('handles zero', () => {
      const item = createItemTree(calc, { text: 'z \\: 0' });
      expect(item.valueOf()).toBe(0);
    });

    it('preserves non-numeric strings', () => {
      const item = createItemTree(calc, { text: 'msg \\: hello world' });
      expect(item.valueOf()).toBe('hello world');
    });

    it('preserves empty string', () => {
      const item = createItemTree(calc, { text: 'empty \\:' });
      expect(item.valueOf()).toBe('');
    });
  });

  describe('computed values (\\=)', () => {
    it('evaluates division', () => {
      const item = createItemTree(calc, { text: 'half \\= 10 / 2' });
      expect(item.valueOf()).toBe(5);
    });

    it('evaluates modulo', () => {
      const item = createItemTree(calc, { text: 'mod \\= 10 % 3' });
      expect(item.valueOf()).toBe(1);
    });

    it('evaluates exponentiation', () => {
      const item = createItemTree(calc, { text: 'pow \\= 2 ** 10' });
      expect(item.valueOf()).toBe(1024);
    });

    it('evaluates string concatenation', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'first \\: hello' },
          { text: 'result \\= first + " world"' },
        ],
      });
      expect(root.items[1].valueOf()).toBe('hello world');
    });

    it('evaluates ternary expressions', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\: 5' },
          { text: 'result \\= x > 3 ? "big" : "small"' },
        ],
      });
      expect(root.items[1].valueOf()).toBe('big');
    });

    it('evaluates comparison operators', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'a \\: 5' },
          { text: 'gt \\= a > 3' },
          { text: 'lt \\= a < 3' },
          { text: 'eq \\= a == 5' },
        ],
      });
      expect(root.items[1].valueOf()).toBe(1); // truthy coerced to number
      expect(root.items[2].valueOf()).toBe(0); // falsy coerced to number
      expect(root.items[3].valueOf()).toBe(1);
    });
  });

  describe('function definitions (\\()', () => {
    it('defines and calls a function', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'double \\(x) = x * 2' },
          { text: 'result \\= double(5)' },
        ],
      });
      expect(root.items[1].valueOf()).toBe(10);
    });

    it('defines multi-argument function', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'add \\(a, b) = a + b' },
          { text: 'result \\= add(3, 4)' },
        ],
      });
      expect(root.items[1].valueOf()).toBe(7);
    });
  });

  describe('variable resolution chains', () => {
    it('resolves through multiple levels', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'a \\: 2' },
          { text: 'b \\= a * 3' },
          { text: 'c \\= b + 1' },
        ],
      });
      expect(root.items[2].valueOf()).toBe(7);
    });

    it('resolves items from variables blocks', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          {
            text: 'variables',
            items: [
              { text: 'tax_rate \\: 0.08' },
            ],
          },
          { text: 'price \\: 100' },
          { text: 'tax \\= price * tax_rate' },
        ],
      });
      expect(root.items[2].valueOf()).toBeCloseTo(8);
    });

    it('prefers closer scope variables', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\: 10' },
          {
            text: 'section',
            items: [
              { text: 'x \\: 20' },
              { text: 'result \\= x' },
            ],
          },
        ],
      });
      expect(root.items[1].items[1].valueOf()).toBe(20);
    });
  });

  describe('$items and aggregate functions', () => {
    it('sum of child values', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          {
            text: 'total \\= sum($items)',
            items: [
              { text: 'a \\: 10' },
              { text: 'b \\: 20' },
              { text: 'c \\: 30' },
            ],
          },
        ],
      });
      // $items refers to the item's own children
      expect(root.items[0].valueOf()).toBe(60);
    });

    it('count of children', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          {
            text: 'group \\= count($items)',
            items: [
              { text: 'a \\: 1' },
              { text: 'b \\: 2' },
              { text: 'c \\: 3' },
            ],
          },
        ],
      });
      expect(root.items[0].valueOf()).toBe(3);
    });
  });

  describe('getComputedText', () => {
    it('returns key: value format for static values', () => {
      const item = createItemTree(calc, { text: 'price \\: 9.99' });
      const computed = item.getComputedText();
      expect(computed).toContain('price');
      expect(computed).toContain('9.99');
    });

    it('returns computed value for expressions', () => {
      const item = createItemTree(calc, { text: 'total \\= 2 + 3' });
      const computed = item.getComputedText();
      expect(computed).toContain('total');
      expect(computed).toContain('5');
    });

    it('returns plain text for items without separator', () => {
      const item = createItemTree(calc, { text: 'just text' });
      const computed = item.getComputedText();
      expect(computed).toBe('just text');
    });
  });

  describe('getComputedHTML', () => {
    it('wraps key and value in spans', () => {
      const item = createItemTree(calc, { text: 'x \\: 42' });
      const html = item.getComputedHTML();
      expect(html).toContain("<span class='key'>");
      expect(html).toContain("<span class='value'>");
    });

    it('includes separator span', () => {
      const item = createItemTree(calc, { text: 'x \\: 42' });
      const html = item.getComputedHTML();
      expect(html).toContain("<span class='separator'>");
    });
  });

  describe('deprecated separators', () => {
    it('[:]  works like \\:', () => {
      const item = createItemTree(calc, { text: 'x [:] 42' });
      expect(item.valueOf()).toBe(42);
    });

    it('[=] works like \\=', () => {
      const item = createItemTree(calc, { text: 'x [=] 1 + 2' });
      expect(item.valueOf()).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('handles very long computation chains without stack overflow', () => {
      const items = [];
      items.push({ text: 'v0 \\: 1' });
      for (let i = 1; i <= 20; i++) {
        items.push({ text: `v${i} \\= v${i-1} + 1` });
      }
      const root = createItemTree(calc, { text: 'root', items: items });
      expect(root.items[20].valueOf()).toBe(21);
    });

    it('handles item referencing itself gracefully', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'self \\= self' }],
      });
      expect(root.items[0].valueOf()).toBeNaN();
    });

    it('handles mutual references gracefully', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'a \\= b' },
          { text: 'b \\= a' },
        ],
      });
      // b references a, but a is before b so a can't see b
      // a should be NaN (b not defined yet), b should reference a which is NaN
      expect(root.items[0].valueOf()).toBeNaN();
    });
  });
});
