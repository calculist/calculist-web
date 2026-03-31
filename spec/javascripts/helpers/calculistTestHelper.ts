/**
 * Test helper that boots a calculist instance using the real TypeScript
 * source modules with mocked browser dependencies.
 *
 * Usage:
 *   const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');
 *   const calc = createCalculist();
 *   const parseItemText = calc.get('parseItemText');
 *   const root = createItemTree(calc, { text: 'root', items: [{ text: 'child' }] });
 */

import _ from 'lodash';

// --- Core modules ---
import Item from '../../../app/javascript/shared/Item/Item';
import itemsByGuid from '../../../app/javascript/shared/Item/itemsByGuid';
import getNewGuid from '../../../app/javascript/shared/utility/getNewGuid';
import parseItemText from '../../../app/javascript/shared/Item/parseItemText';
import parseUntilBalanced from '../../../app/javascript/shared/utility/parseUntilBalanced';
import isItem from '../../../app/javascript/shared/Item/isItem';
import getItemByGuid from '../../../app/javascript/shared/Item/getItemByGuid';
import findVar from '../../../app/javascript/shared/Item/findVar';
import varExists from '../../../app/javascript/shared/Item/varExists';
import computeItemValue from '../../../app/javascript/shared/Item/computeItemValue';
import createComputationContextObject from '../../../app/javascript/shared/Item/createComputationContextObject';
import itemOfFocus from '../../../app/javascript/shared/Item/itemOfFocus';
import parseTextDoc from '../../../app/javascript/shared/Item/parseTextDoc';
import removeHTML from '../../../app/javascript/shared/utility/removeHTML';
import keyToVarName from '../../../app/javascript/shared/utility/keyToVarName';
import jsonToItemTree from '../../../app/javascript/shared/utility/jsonToItemTree';
import wordWrap from '../../../app/javascript/shared/utility/wordWrap';
import keydownToString from '../../../app/javascript/shared/utility/keydownToString';
import calculistFileFormatter from '../../../app/javascript/shared/utility/calculistFileFormatter';

// --- Side-effect modules (directly assign to Item.prototype) ---
import '../../../app/javascript/shared/Item/item.initialize';
import '../../../app/javascript/shared/Item/item.getTopItem';
import '../../../app/javascript/shared/Item/item.toJSON';
import '../../../app/javascript/shared/Item/item.getComputed';
import '../../../app/javascript/shared/Item/item.format';
import '../../../app/javascript/shared/Item/item.formatNumber';
import '../../../app/javascript/shared/Item/item.save';
import '../../../app/javascript/shared/Item/item.valueOf';
import '../../../app/javascript/shared/Item/item.ensureGuidsAreUnique';
import '../../../app/javascript/shared/Item/item.sortItemsBy';
import '../../../app/javascript/shared/Item/item.groupItemsBy';

// --- Named export modules (need mixing into prototype) ---
import item_$item from '../../../app/javascript/shared/Item/item.$item';
import item_refreshSortOrder from '../../../app/javascript/shared/Item/item.refreshSortOrder';
import item_assignLocalVar from '../../../app/javascript/shared/Item/item.assignLocalVar';
import { item_flatten, item_flatten_v2, item__flatten } from '../../../app/javascript/shared/Item/item.flatten';
import item_toMarkdown from '../../../app/javascript/shared/Item/item.toMarkdown';
import item_toHTML from '../../../app/javascript/shared/Item/item.toHTML';
import item_applyDelta from '../../../app/javascript/shared/Item/item.applyDelta';
import item_indent from '../../../app/javascript/shared/Item/item.indent';
import item_outdent from '../../../app/javascript/shared/Item/item.outdent';
import item_moveUp from '../../../app/javascript/shared/Item/item.moveUp';
import item_moveDown from '../../../app/javascript/shared/Item/item.moveDown';

// Wire named methods onto Item.prototype
Object.assign(Item.prototype, {
  $item: item_$item,
  refreshSortOrder: item_refreshSortOrder,
  assignLocalVar: item_assignLocalVar,
  flatten: item_flatten,
  flatten_v2: item_flatten_v2,
  _flatten: item__flatten,
  toMarkdown: item_toMarkdown,
  toHTML: item_toHTML,
  applyDelta: item_applyDelta,
  indent: item_indent,
  outdent: item_outdent,
  moveUp: item_moveUp,
  moveDown: item_moveDown,
});

// Override save() to prevent infinite recursion in tests
Item.prototype.save = function() {};

// Module lookup map for calc.get() API
const modules: Record<string, any> = {
  Item,
  itemsByGuid,
  getNewGuid,
  parseItemText,
  parseUntilBalanced,
  isItem,
  getItemByGuid,
  findVar,
  varExists,
  computeItemValue,
  createComputationContextObject,
  itemOfFocus,
  parseTextDoc,
  removeHTML,
  keyToVarName,
  jsonToItemTree,
  wordWrap,
  keydownToString,
  calculistFileFormatter,
};

/**
 * Creates a calculist test instance with a get() method for module lookup.
 * Uses singleton pattern for performance.
 */
function createCalculist(_options?: any) {
  if ((global as any).__calculistTestInstance) return (global as any).__calculistTestInstance;

  const instance = {
    get: function(name: string) {
      if (!(name in modules)) {
        throw new Error('Unknown module: ' + name + '. Available: ' + Object.keys(modules).join(', '));
      }
      return modules[name];
    },
  };

  (global as any).__calculistTestInstance = instance;
  return instance;
}

/**
 * Creates a test item tree from a simple nested object structure.
 * Example: createItemTree(calc, { text: 'root', items: [{ text: 'child' }] })
 */
function createItemTree(_calc: any, data: any, parent?: any) {
  // Clear itemsByGuid for clean state (only at root level)
  if (!parent) {
    Object.keys(itemsByGuid).forEach(function(k) { delete itemsByGuid[k]; });
  }

  const options: any = {
    text: data.text || '',
    guid: data.guid || getNewGuid(),
    parent: parent || null,
    collapsed: data.collapsed || false,
    sort_order: data.sort_order || 100,
    items: (data.items || []).map(function(child: any, i: number) {
      return Object.assign({}, child, {
        guid: child.guid || getNewGuid(),
        sort_order: child.sort_order || (i + 1) * 100,
      });
    }),
  };

  const item = new (Item as any)(options);
  if (!parent) {
    (global as any).window = (global as any).window || {};
    (global as any).window.topItem = item;
  }
  return item;
}

module.exports = { createCalculist, createItemTree };
