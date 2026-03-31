const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');

describe('Serialization and parsing', () => {
  let calc, itemsByGuid;

  beforeAll(() => {
    calc = createCalculist();
    itemsByGuid = calc.get('itemsByGuid');
  });

  beforeEach(() => {
    Object.keys(itemsByGuid).forEach(k => delete itemsByGuid[k]);
  });

  describe('toMarkdown', () => {
    it('renders root as underlined heading', () => {
      const root = createItemTree(calc, { text: 'My Document' });
      const md = root.toMarkdown(0, false);
      expect(md).toContain('My Document');
      expect(md).toContain('===========');
    });

    it('renders children as bullet points', () => {
      const root = createItemTree(calc, {
        text: 'Doc',
        items: [{ text: 'Item 1' }, { text: 'Item 2' }],
      });
      const md = root.toMarkdown(0, false);
      expect(md).toContain('* Item 1');
      expect(md).toContain('* Item 2');
    });

    it('nests bullet points with indentation', () => {
      const root = createItemTree(calc, {
        text: 'Doc',
        items: [
          { text: 'Parent', items: [{ text: 'Child' }] },
        ],
      });
      const md = root.toMarkdown(0, false);
      expect(md).toContain('* Parent');
      expect(md).toContain('    * Child');
    });

    it('hides collapsed children when requested', () => {
      const root = createItemTree(calc, {
        text: 'Doc',
        items: [
          { text: 'Visible', collapsed: true, items: [{ text: 'Hidden' }] },
        ],
      });
      const md = root.toMarkdown(0, false, true);
      expect(md).toContain('Visible');
      expect(md).not.toContain('Hidden');
    });
  });

  describe('toHTML', () => {
    it('wraps items in li tags', () => {
      const root = createItemTree(calc, { text: 'hello' });
      const html = root.toHTML(true);
      expect(html).toContain('<li>');
      expect(html).toContain('<span>hello</span>');
      expect(html).toContain('</li>');
    });

    it('nests children in ul tags', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'child' }],
      });
      const html = root.toHTML(true);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li><span>child</span></li>');
      expect(html).toContain('</ul>');
    });

    it('escapes HTML in uncomputed mode', () => {
      const root = createItemTree(calc, { text: '<script>alert("xss")</script>' });
      const html = root.toHTML(true);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('hides collapsed item children when requested', () => {
      // toHTML checks collapsed on each item but only when hideCollapsed=true
      // collapsed is only set on non-root items (initialize forces false for root)
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'section', collapsed: true, items: [{ text: 'hidden child' }] },
        ],
      });
      // Verify collapsed was actually set
      expect(root.items[0].collapsed).toBe(true);
      const html = root.items[0].toHTML(true, true);
      expect(html).toContain('section');
      expect(html).not.toContain('<ul>');
    });
  });

  describe('parseTextDoc', () => {
    let parseTextDoc;

    beforeAll(() => {
      parseTextDoc = calc.get('parseTextDoc');
    });

    it('parses flat text into items', () => {
      const result = parseTextDoc('line 1\nline 2\nline 3');
      expect(result.length).toBe(3);
      expect(result[0].text).toBe('line 1');
      expect(result[1].text).toBe('line 2');
    });

    it('parses indented text into nested items', () => {
      const result = parseTextDoc('parent\n  child 1\n  child 2');
      expect(result.length).toBe(1);
      expect(result[0].text).toBe('parent');
      expect(result[0].items.length).toBe(2);
      expect(result[0].items[0].text).toBe('child 1');
    });

    it('handles deeper nesting', () => {
      const result = parseTextDoc('root\n  parent\n    grandchild');
      expect(result[0].items[0].items[0].text).toBe('grandchild');
    });

    it('handles multiple top-level items', () => {
      const result = parseTextDoc('item 1\n  child\nitem 2');
      expect(result.length).toBe(2);
      expect(result[0].items.length).toBe(1);
    });

    it('skips empty lines', () => {
      const result = parseTextDoc('line 1\n\nline 2');
      expect(result.length).toBe(2);
    });

    it('parses with guids when option is set', () => {
      const result = parseTextDoc('guid1|line 1\nguid2|  child', { withGuids: true });
      expect(result[0].guid).toBe('guid1');
      expect(result[0].text).toBe('line 1');
      expect(result[0].items[0].guid).toBe('guid2');
    });
  });

  describe('jsonToItemTree', () => {
    let jsonToItemTree;

    beforeAll(() => {
      jsonToItemTree = calc.get('jsonToItemTree');
    });

    it('converts simple object to tree', () => {
      const result = jsonToItemTree({ name: 'Dan', age: 30 });
      expect(result.items.length).toBe(2);
      expect(result.items[0].text).toContain('name');
      expect(result.items[0].text).toContain('Dan');
    });

    it('converts nested object to nested tree', () => {
      const result = jsonToItemTree({ user: { name: 'Dan' } });
      expect(result.items[0].text).toBe('user');
      expect(result.items[0].items[0].text).toContain('name');
    });

    it('uses \\: separator for leaf values', () => {
      const result = jsonToItemTree({ x: 42 });
      expect(result.items[0].text).toContain('\\:');
      expect(result.items[0].text).toContain('42');
    });

    it('generates guids for each item', () => {
      const result = jsonToItemTree({ a: 1 });
      expect(result.guid).toBeTruthy();
      expect(result.items[0].guid).toBeTruthy();
      expect(result.guid).not.toBe(result.items[0].guid);
    });

    it('parses JSON string input', () => {
      const result = jsonToItemTree('{"key": "value"}');
      expect(result.items[0].text).toContain('key');
    });

    it('uses custom root text', () => {
      const result = jsonToItemTree({ a: 1 }, 'my root');
      expect(result.text).toBe('my root');
    });

    it('defaults to ... when no text', () => {
      const result = jsonToItemTree({ a: 1 });
      expect(result.text).toBe('...');
    });
  });

  describe('wordWrap', () => {
    let wordWrap;

    beforeAll(() => {
      wordWrap = calc.get('wordWrap');
    });

    it('wraps text to specified width', () => {
      const lines = wordWrap.getLines('hello world this is a test', 10);
      expect(lines.length).toBeGreaterThan(1);
      lines.forEach(line => {
        expect(line.trim().length).toBeLessThanOrEqual(12); // some slack for word boundaries
      });
    });

    it('returns single line for short text', () => {
      const lines = wordWrap.getLines('short', 80);
      expect(lines.length).toBe(1);
    });

    it('handles empty string', () => {
      const lines = wordWrap.getLines('', 80);
      expect(lines).toEqual([]);
    });

    it('handles null/undefined', () => {
      const lines = wordWrap.getLines(null, 80);
      expect(lines).toEqual([]);
    });
  });

  describe('keydownToString', () => {
    let keydownToString;

    beforeAll(() => {
      keydownToString = calc.get('keydownToString');
    });

    it('converts simple key press', () => {
      const result = keydownToString({ which: 65, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false });
      expect(result).toBe('a');
    });

    it('converts enter key', () => {
      const result = keydownToString({ which: 13, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false });
      expect(result).toBe('enter');
    });

    it('converts tab key', () => {
      const result = keydownToString({ which: 9, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false });
      expect(result).toBe('tab');
    });

    it('includes meta key modifier', () => {
      const result = keydownToString({ which: 65, metaKey: true, ctrlKey: false, altKey: false, shiftKey: false });
      expect(result).toBe('cmd + a');
    });

    it('includes ctrl modifier', () => {
      const result = keydownToString({ which: 65, metaKey: false, ctrlKey: true, altKey: false, shiftKey: false });
      expect(result).toBe('ctrl + a');
    });

    it('includes multiple modifiers', () => {
      const result = keydownToString({ which: 65, metaKey: true, ctrlKey: false, altKey: true, shiftKey: true });
      expect(result).toBe('cmd + alt + shift + a');
    });

    it('converts arrow keys', () => {
      expect(keydownToString({ which: 38, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false })).toBe('up');
      expect(keydownToString({ which: 40, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false })).toBe('down');
      expect(keydownToString({ which: 37, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false })).toBe('left');
      expect(keydownToString({ which: 39, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false })).toBe('right');
    });

    it('converts delete/backspace', () => {
      const result = keydownToString({ which: 8, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false });
      expect(result).toBe('delete');
    });

    it('returns only modifier name for standalone modifier keys', () => {
      // keyCode 16 (shift) maps to false in otherKeys, so no char is appended
      const result = keydownToString({ which: 16, metaKey: false, ctrlKey: false, altKey: false, shiftKey: true });
      expect(result).toBe('shift');
    });
  });

  describe('calculistFileFormatter', () => {
    let calculistFileFormatter;

    beforeAll(() => {
      calculistFileFormatter = calc.get('calculistFileFormatter');
    });

    it('serializes item to JSON string', () => {
      const root = createItemTree(calc, {
        text: 'doc',
        items: [{ text: 'child' }],
      });
      const json = calculistFileFormatter.toCalculistFile(root);
      const parsed = JSON.parse(json);
      expect(parsed.text).toBe('doc');
      expect(parsed.items[0].text).toBe('child');
    });

    it('round-trips through toJSON and parse', () => {
      const root = createItemTree(calc, {
        text: 'root',
        guid: 'root-guid',
        items: [{ text: 'child', guid: 'child-guid' }],
      });
      global.window.topItem = root;
      const text = root.toText(0, { computed: false, prependGuid: true });
      const parsed = calculistFileFormatter.parseFile(text);
      expect(parsed[0].text).toBe('root');
      expect(parsed[0].guid).toBe('root-guid');
      expect(parsed[0].items[0].text).toBe('child');
      expect(parsed[0].items[0].guid).toBe('child-guid');
    });
  });
});
