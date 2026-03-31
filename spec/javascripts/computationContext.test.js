const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');

describe('Computation context object', () => {
  let calc, itemsByGuid;

  beforeAll(() => {
    calc = createCalculist();
    itemsByGuid = calc.get('itemsByGuid');
  });

  beforeEach(() => {
    Object.keys(itemsByGuid).forEach(k => delete itemsByGuid[k]);
  });

  describe('preprocessor aliases', () => {
    it('^item resolves to $$item (ancestor lookup)', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\: 42' },
          {
            text: 'section',
            items: [
              // ^item should become $$item, which searches ancestors
              { text: 'result \\= ^item("x")' },
            ],
          },
        ],
      });
      expect(root.items[1].items[0].valueOf()).toBe(42);
    });

    it('$siblings resolves to $siblings() function call', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'a \\: 1' },
          { text: 'b \\: 2' },
          { text: 'result \\= count($siblings)' },
        ],
      });
      expect(root.items[2].valueOf()).toBe(2);
    });
  });

  describe('context item accessors', () => {
    it('$items returns child items', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'parent \\= count($items)',
          items: [
            { text: 'a' },
            { text: 'b' },
            { text: 'c' },
          ],
        }],
      });
      expect(root.items[0].valueOf()).toBe(3);
    });

    it('$parent references the parent item', () => {
      const root = createItemTree(calc, {
        text: 'root \\: 99',
        items: [
          { text: 'child \\= $parent' },
        ],
      });
      const val = root.items[0].valueOf();
      expect(val).toBe(99); // $parent resolves to root, whose valueOf is 99
    });

    it('$index returns position among siblings', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'first \\= $index' },
          { text: 'second \\= $index' },
          { text: 'third \\= $index' },
        ],
      });
      expect(root.items[0].valueOf()).toBe(0);
      expect(root.items[1].valueOf()).toBe(1);
      expect(root.items[2].valueOf()).toBe(2);
    });

    it('$name returns the item key', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'my_item \\= $name' },
        ],
      });
      expect(root.items[0].valueOf()).toBe('my_item');
    });

    it('$guid returns the item guid', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'item \\= $guid' },
        ],
      });
      const val = root.items[0].valueOf();
      expect(val).toBe(root.items[0].guid);
    });
  });

  describe('math context', () => {
    it('PI is available', () => {
      const item = createItemTree(calc, { text: 'x \\= PI' });
      expect(item.valueOf()).toBeCloseTo(Math.PI);
    });

    it('abs works', () => {
      const item = createItemTree(calc, { text: 'x \\= abs(-5)' });
      expect(item.valueOf()).toBe(5);
    });

    it('sqrt works', () => {
      const item = createItemTree(calc, { text: 'x \\= sqrt(16)' });
      expect(item.valueOf()).toBe(4);
    });

    it('floor works', () => {
      const item = createItemTree(calc, { text: 'x \\= floor(3.7)' });
      expect(item.valueOf()).toBe(3);
    });

    it('ceil works', () => {
      const item = createItemTree(calc, { text: 'x \\= ceil(3.2)' });
      expect(item.valueOf()).toBe(4);
    });

    it('round works', () => {
      const item = createItemTree(calc, { text: 'x \\= round(3.5)' });
      expect(item.valueOf()).toBe(4);
    });

    it('min and max work on $items', () => {
      // min/max in the context are itemsFirst-wrapped, so they operate
      // on item arrays, not raw number arguments
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'lo \\= min($items)',
          items: [{ text: 'a \\: 3' }, { text: 'b \\: 1' }, { text: 'c \\: 2' }],
        }, {
          text: 'hi \\= max($items)',
          items: [{ text: 'a \\: 3' }, { text: 'b \\: 1' }, { text: 'c \\: 2' }],
        }],
      });
      expect(root.items[0].valueOf()).toBe(1);
      expect(root.items[1].valueOf()).toBe(3);
    });

    it('pow works', () => {
      const item = createItemTree(calc, { text: 'x \\= pow(2, 8)' });
      expect(item.valueOf()).toBe(256);
    });
  });

  describe('aggregate functions on $items', () => {
    let parent;

    beforeEach(() => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'data',
          items: [
            { text: 'a \\: 10' },
            { text: 'b \\: 20' },
            { text: 'c \\: 30' },
          ],
        }],
      });
      parent = root.items[0];
    });

    it('sum computes total', () => {
      parent.text = 'data \\= sum($items)';
      expect(parent.valueOf()).toBe(60);
    });

    it('average/mean computes average', () => {
      parent.text = 'data \\= average($items)';
      expect(parent.valueOf()).toBe(20);
    });

    it('count returns number of children', () => {
      parent.text = 'data \\= count($items)';
      expect(parent.valueOf()).toBe(3);
    });

    it('min finds minimum', () => {
      parent.text = 'data \\= min($items)';
      expect(parent.valueOf()).toBe(10);
    });

    it('max finds maximum', () => {
      parent.text = 'data \\= max($items)';
      expect(parent.valueOf()).toBe(30);
    });
  });

  describe('lodash string functions', () => {
    it('toUpper works', () => {
      const item = createItemTree(calc, { text: 'x \\= toUpper("hello")' });
      expect(item.valueOf()).toBe('HELLO');
    });

    it('toLower works', () => {
      const item = createItemTree(calc, { text: 'x \\= toLower("HELLO")' });
      expect(item.valueOf()).toBe('hello');
    });

    it('capitalize works', () => {
      const item = createItemTree(calc, { text: 'x \\= capitalize("hello")' });
      expect(item.valueOf()).toBe('Hello');
    });

    it('repeat works', () => {
      const item = createItemTree(calc, { text: 'x \\= repeat("ab", 3)' });
      expect(item.valueOf()).toBe('ababab');
    });
  });

  describe('boolean and null constants', () => {
    it('true is available', () => {
      const item = createItemTree(calc, { text: 'x \\= true' });
      expect(item.valueOf()).toBe(1); // true coerces to 1
    });

    it('false is available', () => {
      const item = createItemTree(calc, { text: 'x \\= false' });
      expect(item.valueOf()).toBe(0); // false coerces to 0
    });
  });

  describe('custom math functions', () => {
    it('gcd computes greatest common divisor', () => {
      const item = createItemTree(calc, { text: 'x \\= gcd(12, 8)' });
      expect(item.valueOf()).toBe(4);
    });

    it('lcm computes least common multiple', () => {
      const item = createItemTree(calc, { text: 'x \\= lcm(4, 6)' });
      expect(item.valueOf()).toBe(12);
    });

    it('fraction formats as string', () => {
      const item = createItemTree(calc, { text: 'x \\= fraction(3, 6)' });
      expect(item.valueOf()).toBe('1/2');
    });

    it('binomialCoefficient computes C(n,k)', () => {
      const item = createItemTree(calc, { text: 'x \\= binomialCoefficient(5, 2)' });
      expect(item.valueOf()).toBe(10);
    });

    it('modulo handles negative numbers correctly', () => {
      const item = createItemTree(calc, { text: 'x \\= mod(-1, 5)' });
      expect(item.valueOf()).toBe(4); // mathematical modulo, not JS %
    });

    it('isInteger checks for integers', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'a \\= isInteger(5)' },
          { text: 'b \\= isInteger(5.5)' },
        ],
      });
      expect(root.items[0].valueOf()).toBe(1); // true
      expect(root.items[1].valueOf()).toBe(0); // false
    });
  });

  describe('coordinate conversion', () => {
    it('degreesToRadians converts correctly', () => {
      const item = createItemTree(calc, { text: 'x \\= degreesToRadians(180)' });
      expect(item.valueOf()).toBeCloseTo(Math.PI);
    });

    it('radiansToDegrees converts correctly', () => {
      const item = createItemTree(calc, { text: 'x \\= radiansToDegrees(PI)' });
      expect(item.valueOf()).toBeCloseTo(180);
    });
  });

  describe('type checking', () => {
    it('isNumber works', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\: 5' },
          { text: 'result \\= isNumber(x)' },
        ],
      });
      expect(root.items[1].valueOf()).toBe(1);
    });

    it('isString works', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'x \\: hello' },
          { text: 'result \\= isString(x)' },
        ],
      });
      expect(root.items[1].valueOf()).toBe(1);
    });

    it('isArray works on $items', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'result \\= isArray($items)',
          items: [{ text: 'child' }],
        }],
      });
      expect(root.items[0].valueOf()).toBe(1);
    });
  });

  describe('item tree query functions', () => {
    it('$item finds child by key in expression', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'result \\= $item("price")',
          items: [
            { text: 'price \\: 25' },
            { text: 'quantity \\: 3' },
          ],
        }],
      });
      expect(root.items[0].valueOf()).toBe(25);
    });

    it('map extracts values from items', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'result \\= sum(map($items, valueOf))',
          items: [
            { text: 'a \\: 1' },
            { text: 'b \\: 2' },
            { text: 'c \\: 3' },
          ],
        }],
      });
      expect(root.items[0].valueOf()).toBe(6);
    });

    it('recursiveCount counts all descendants', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'total \\= rcount($items)',
          items: [
            { text: 'a', items: [{ text: 'a1' }, { text: 'a2' }] },
            { text: 'b' },
          ],
        }],
      });
      // 3 direct + 2 nested = but rcount counts items[0] children: a(+2 children) + b = 2 + 2 = 4?
      // Actually: rcount($items) = items.length + rcount of each child's items
      // items = [a, b], a.items = [a1, a2], b.items = []
      // rcount = 2 + (2 + 0) + (0) = 4
      expect(root.items[0].valueOf()).toBe(4);
    });
  });

  describe('lambda/function creation in expressions', () => {
    it('fn creates an inline function', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{
          text: 'result \\= map($items, fn("x|x * 2"))',
          items: [
            { text: 'a \\: 3' },
            { text: 'b \\: 5' },
          ],
        }],
      });
      const val = root.items[0].valueOf();
      expect(Array.isArray(val)).toBe(true);
      expect(val).toEqual([6, 10]);
    });
  });

  describe('range function', () => {
    it('generates a range of numbers', () => {
      const item = createItemTree(calc, { text: 'x \\= range(5)' });
      const val = item.valueOf();
      expect(Array.isArray(val)).toBe(true);
      expect(val).toEqual([0, 1, 2, 3, 4]);
    });

    it('generates a range with start and end', () => {
      const item = createItemTree(calc, { text: 'x \\= range(2, 5)' });
      expect(item.valueOf()).toEqual([2, 3, 4]);
    });
  });

  describe('wordCount', () => {
    it('counts words in an item', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'hello world foo' },
          { text: 'count \\= wordCount(^item("hello world foo"))' },
        ],
      });
      expect(root.items[1].valueOf()).toBe(3);
    });
  });
});
