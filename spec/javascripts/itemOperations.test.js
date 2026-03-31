const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');

describe('Item operations', () => {
  let calc, Item, getNewGuid, itemsByGuid;

  beforeAll(() => {
    calc = createCalculist();
    Item = calc.get('Item');
    getNewGuid = calc.get('getNewGuid');
    itemsByGuid = calc.get('itemsByGuid');
  });

  beforeEach(() => {
    Object.keys(itemsByGuid).forEach(k => delete itemsByGuid[k]);
  });

  describe('$item (item finder)', () => {
    let root;

    beforeEach(() => {
      root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'alpha \\: 1' },
          { text: 'beta \\: 2', items: [{ text: 'gamma \\: 3' }] },
          { text: 'delta \\: 4' },
        ],
      });
    });

    it('finds child by string key', () => {
      const found = root.$item('beta');
      expect(found).toBe(root.items[1]);
    });

    it('finds nested child by key (breadth-first)', () => {
      const found = root.$item('gamma');
      expect(found).toBe(root.items[1].items[0]);
    });

    it('finds child by numeric index', () => {
      expect(root.$item(0)).toBe(root.items[0]);
      expect(root.$item(1)).toBe(root.items[1]);
      expect(root.$item(2)).toBe(root.items[2]);
    });

    it('supports negative indices', () => {
      expect(root.$item(-1)).toBe(root.items[2]);
      expect(root.$item(-2)).toBe(root.items[1]);
    });

    it('finds child by function predicate', () => {
      const found = root.$item(function(item) { return item.text.includes('delta'); });
      expect(found).toBe(root.items[2]);
    });

    it('finds child by regex', () => {
      const found = root.$item(/alph/);
      expect(found).toBe(root.items[0]);
    });

    it('returns undefined when not found', () => {
      expect(root.$item('nonexistent')).toBeUndefined();
    });
  });

  describe('indent', () => {
    it('makes item a child of previous sibling', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'sibling 1' },
          { text: 'to indent' },
        ],
      });
      const toIndent = root.items[1];
      const newParent = root.items[0];
      toIndent.indent();
      expect(newParent.items).toContain(toIndent);
      expect(toIndent.parent).toBe(newParent);
      expect(root.items.length).toBe(1);
    });

    it('does nothing when no upper sibling', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'first child' }],
      });
      const child = root.items[0];
      child.indent();
      expect(child.parent).toBe(root);
      expect(root.items.length).toBe(1);
    });
  });

  describe('outdent', () => {
    it('moves item to grandparent after previous parent', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'parent', items: [{ text: 'to outdent' }] },
          { text: 'uncle' },
        ],
      });
      const toOutdent = root.items[0].items[0];
      const originalParent = root.items[0];
      toOutdent.outdent();
      expect(toOutdent.parent).toBe(root);
      expect(root.items.indexOf(toOutdent)).toBe(root.items.indexOf(originalParent) + 1);
    });

    it('does nothing at top level', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'child' }],
      });
      const child = root.items[0];
      // root has no parent, so outdent should be a no-op
      child.outdent();
      expect(child.parent).toBe(root);
    });
  });

  describe('moveUp', () => {
    it('swaps with upper sibling', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'first' },
          { text: 'second' },
          { text: 'third' },
        ],
      });
      const second = root.items[1];
      second.moveUp();
      expect(root.items[0]).toBe(second);
      expect(root.items[0].text).toBe('second');
    });
  });

  describe('moveDown', () => {
    it('swaps with next sibling', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'first' },
          { text: 'second' },
          { text: 'third' },
        ],
      });
      const first = root.items[0];
      first.moveDown();
      expect(root.items[1]).toBe(first);
      expect(root.items[1].text).toBe('first');
    });
  });

  describe('ensureGuidsAreUnique', () => {
    it('returns 0 when all guids are unique', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'a' }, { text: 'b' }],
      });
      const duplicates = root.ensureGuidsAreUnique();
      expect(duplicates).toBe(0);
    });

    it('fixes duplicate guids and returns count', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'a' }, { text: 'b' }],
      });
      // Force duplicate guid
      const originalGuid = root.items[0].guid;
      root.items[1].guid = originalGuid;
      const duplicates = root.ensureGuidsAreUnique();
      expect(duplicates).toBe(1);
      expect(root.items[0].guid).not.toBe(root.items[1].guid);
    });
  });

  describe('sortItemsBy', () => {
    it('sorts children by function', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'c \\: 3' },
          { text: 'a \\: 1' },
          { text: 'b \\: 2' },
        ],
      });
      const sorted = root.sortItemsBy(function(item) { return item.text; });
      expect(sorted.map(i => i.key)).toEqual(['a', 'b', 'c']);
    });

    it('sorts by string key using $item lookup', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'item 2', items: [{ text: 'order \\: 2' }] },
          { text: 'item 1', items: [{ text: 'order \\: 1' }] },
          { text: 'item 3', items: [{ text: 'order \\: 3' }] },
        ],
      });
      const sorted = root.sortItemsBy('order');
      expect(sorted[0].text).toBe('item 1');
      expect(sorted[1].text).toBe('item 2');
      expect(sorted[2].text).toBe('item 3');
    });
  });

  describe('groupItemsBy', () => {
    it('groups children by function', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'apple' },
          { text: 'banana' },
          { text: 'avocado' },
        ],
      });
      root.groupItemsBy(function(item) {
        return item.text[0]; // Group by first letter
      });
      expect(root.items.length).toBe(2); // 'a' group and 'b' group
      const aGroup = root.items.find(i => i.text === 'a');
      const bGroup = root.items.find(i => i.text === 'b');
      expect(aGroup.items.length).toBe(2);
      expect(bGroup.items.length).toBe(1);
    });
  });

  describe('applyDelta', () => {
    it('applies property changes from delta', () => {
      const root = createItemTree(calc, { text: 'original' });
      root.applyDelta({ text: ['original', 'updated'] });
      expect(root.text).toBe('updated');
    });

    it('applies collapsed change', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'child' }],
      });
      root.applyDelta({ collapsed: [false, true] });
      expect(root.collapsed).toBe(true);
    });

    it('reconstructs items from guid list', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'child 1' },
          { text: 'child 2' },
        ],
      });
      const guid1 = root.items[0].guid;
      const guid2 = root.items[1].guid;
      // Reverse the order via delta
      root.applyDelta({
        items: ['', guid2 + ',' + guid1],
      });
      expect(root.items[0].guid).toBe(guid2);
      expect(root.items[1].guid).toBe(guid1);
    });

    it('does nothing when delta is null', () => {
      const root = createItemTree(calc, { text: 'unchanged' });
      root.applyDelta(null);
      expect(root.text).toBe('unchanged');
    });
  });
});
