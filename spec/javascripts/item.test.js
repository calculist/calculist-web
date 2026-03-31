const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');

describe('Item', () => {
  let calc, Item, getNewGuid, itemsByGuid;

  beforeAll(() => {
    calc = createCalculist();
    Item = calc.get('Item');
    getNewGuid = calc.get('getNewGuid');
    itemsByGuid = calc.get('itemsByGuid');
  });

  beforeEach(() => {
    // Clear global state between tests
    Object.keys(itemsByGuid).forEach(k => delete itemsByGuid[k]);
  });

  describe('initialization', () => {
    it('creates an item with text', () => {
      const item = createItemTree(calc, { text: 'hello' });
      expect(item.text).toBe('hello');
    });

    it('requires a guid', () => {
      expect(() => new Item({ text: 'no guid' })).toThrow('guid required');
    });

    it('rejects duplicate guids', () => {
      const guid = getNewGuid();
      createItemTree(calc, { text: 'first', guid: guid });
      expect(() => new Item({ text: 'second', guid: guid })).toThrow('guids must be unique');
    });

    it('registers item in itemsByGuid', () => {
      const guid = getNewGuid();
      const item = createItemTree(calc, { text: 'test', guid: guid });
      expect(itemsByGuid[guid]).toBe(item);
    });

    it('sets depth based on parent', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'child' }],
      });
      expect(root.depth).toBe(0);
      expect(root.items[0].depth).toBe(1);
    });

    it('initializes child items', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'child 1' },
          { text: 'child 2' },
        ],
      });
      expect(root.items.length).toBe(2);
      expect(root.items[0].text).toBe('child 1');
      expect(root.items[1].text).toBe('child 2');
    });

    it('sets parent reference on children', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'child' }],
      });
      expect(root.items[0].parent).toBe(root);
    });
  });

  describe('tree navigation', () => {
    let root, child1, child2, grandchild;

    beforeEach(() => {
      root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'child 1', items: [{ text: 'grandchild' }] },
          { text: 'child 2' },
        ],
      });
      child1 = root.items[0];
      child2 = root.items[1];
      grandchild = child1.items[0];
    });

    it('getTotalItemCount returns recursive count', () => {
      expect(root.getTotalItemCount()).toBe(3);
      expect(child1.getTotalItemCount()).toBe(1);
      expect(child2.getTotalItemCount()).toBe(0);
    });

    it('getTopItem returns the root', () => {
      expect(grandchild.getTopItem()).toBe(root);
      expect(child1.getTopItem()).toBe(root);
      expect(root.getTopItem()).toBe(root);
    });

    it('$siblings returns sibling items', () => {
      expect(child1.$siblings()).toEqual([child2]);
      expect(child2.$siblings()).toEqual([child1]);
    });

    it('getUpperSibling returns previous sibling', () => {
      expect(root.getUpperSibling(child2)).toBe(child1);
      expect(root.getUpperSibling(child1)).toBeUndefined();
    });

    it('getNextSibling returns next sibling', () => {
      expect(root.getNextSibling(child1)).toBe(child2);
      expect(root.getNextSibling(child2)).toBeUndefined();
    });

    it('$$item finds ancestor or previous sibling by key', () => {
      const found = grandchild.$$item('child 1');
      expect(found).toBe(child1);
    });

    it('$$item searches up the tree', () => {
      const found = grandchild.$$item('root');
      expect(found).toBe(root);
    });

    it('$$item returns undefined when not found', () => {
      expect(grandchild.$$item('nonexistent')).toBeUndefined();
    });

    it('$lastItem finds descendant by key', () => {
      const found = root.$lastItem('grandchild');
      expect(found).toBe(grandchild);
    });
  });

  describe('tree manipulation', () => {
    let root, child1, child2;

    beforeEach(() => {
      root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'child 1' },
          { text: 'child 2' },
        ],
      });
      child1 = root.items[0];
      child2 = root.items[1];
    });

    it('removeChild removes a child', () => {
      root.removeChild(child1);
      expect(root.items).toEqual([child2]);
    });

    it('insertAt inserts at index', () => {
      const newItem = new Item({ text: 'new', guid: getNewGuid(), parent: root });
      root.insertAt(newItem, 1);
      expect(root.items[1]).toBe(newItem);
      expect(root.items.length).toBe(3);
    });

    it('insertAfter inserts after a sibling', () => {
      const newItem = new Item({ text: 'new', guid: getNewGuid(), parent: root });
      root.insertAfter(newItem, child1);
      expect(root.items[1]).toBe(newItem);
      expect(root.items[2]).toBe(child2);
    });

    it('insertBefore inserts before a sibling', () => {
      const newItem = new Item({ text: 'new', guid: getNewGuid(), parent: root });
      root.insertBefore(newItem, child2);
      expect(root.items[1]).toBe(newItem);
      expect(root.items[2]).toBe(child2);
    });

    it('refreshDepth updates depths recursively', () => {
      // Move child2 under child1 and refresh
      root.removeChild(child2);
      child1.items.push(child2);
      child2.parent = child1;
      child1.refreshDepth();
      expect(child2.depth).toBe(child1.depth + 1);
    });
  });

  describe('toJSON', () => {
    it('serializes to nested JSON', () => {
      const root = createItemTree(calc, {
        text: 'root',
        guid: 'root-guid',
        items: [{ text: 'child', guid: 'child-guid' }],
      });
      const json = root.toJSON();
      expect(json.text).toBe('root');
      expect(json.guid).toBe('root-guid');
      expect(json.items.length).toBe(1);
      expect(json.items[0].text).toBe('child');
      expect(json.items[0].guid).toBe('child-guid');
    });

    it('includes collapsed state', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [{ text: 'child', collapsed: true }],
      });
      // collapsed is only true if item has a parent
      expect(root.items[0].toJSON().collapsed).toBe(true);
    });

    it('includes sort_order', () => {
      const root = createItemTree(calc, {
        text: 'root',
        sort_order: 42,
      });
      expect(root.toJSON().sort_order).toBe(42);
    });
  });

  describe('toFlatJSON_v2', () => {
    it('returns flat structure with parent_guid', () => {
      const root = createItemTree(calc, {
        text: 'root',
        guid: 'root-guid',
        items: [{ text: 'child', guid: 'child-guid' }],
      });
      global.window.topItem = root;

      const rootFlat = root.toFlatJSON_v2();
      expect(rootFlat.text).toBe('root');
      expect(rootFlat.parent_guid).toBeNull();
      expect(rootFlat.guid).toBe('root-guid');

      const childFlat = root.items[0].toFlatJSON_v2();
      expect(childFlat.parent_guid).toBe('root-guid');
      expect(childFlat.guid).toBe('child-guid');
    });
  });

  describe('toText', () => {
    it('serializes to indented text', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'child 1' },
          { text: 'child 2' },
        ],
      });
      const text = root.toText(0, { computed: false });
      expect(text).toContain('root');
      expect(text).toContain('  child 1');
      expect(text).toContain('  child 2');
    });

    it('hides collapsed children when requested', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'child', collapsed: true, items: [{ text: 'grandchild' }] },
        ],
      });
      const text = root.toText(0, { computed: false, hideCollapsed: true });
      expect(text).toContain('child');
      expect(text).not.toContain('grandchild');
    });
  });

  describe('flatten', () => {
    it('returns flat array of item JSON', () => {
      const root = createItemTree(calc, {
        text: 'root',
        items: [
          { text: 'child 1' },
          { text: 'child 2', items: [{ text: 'grandchild' }] },
        ],
      });
      const flat = root.flatten();
      expect(flat.length).toBe(4);
      expect(flat[0].text).toBe('root');
    });

    it('flatten_v2 returns flat array with parent_guid', () => {
      const root = createItemTree(calc, {
        text: 'root',
        guid: 'root-guid',
        items: [{ text: 'child', guid: 'child-guid' }],
      });
      global.window.topItem = root;
      const flat = root.flatten_v2();
      expect(flat.length).toBe(2);
      expect(flat[0].parent_guid).toBeNull();
      expect(flat[1].parent_guid).toBe('root-guid');
    });
  });
});
