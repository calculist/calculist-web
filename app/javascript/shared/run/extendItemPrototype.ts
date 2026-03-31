/**
 * Wires all item.* methods onto Item.prototype.
 *
 * This replaces the original extendItemPrototype.js which used:
 *   calculist.require(['Item.prototype','item'], _.extend)
 *
 * There are two types of Item extensions:
 * 1. calculist.register('item.methodName', ...) — returns a function, needs mixing in
 * 2. calculist.require(['Item', ...], fn) — directly assigns to Item.prototype as side effect
 *
 * Type 2 modules are imported for side effects only.
 * Type 1 modules are imported and assigned to Item.prototype.
 */

import Item from '../Item/Item';

// --- Type 1: Named item.* methods that need mixing into prototype ---
import item_$item from '../Item/item.$item';
import { item_addChild, item_addNewChildBefore, item_addNewChildAfter } from '../Item/item.addChild';
import item_applyDelta from '../Item/item.applyDelta';
import item_applyLocalStyle from '../Item/item.applyLocalStyle';
import item_applySyntaxHighlighting from '../Item/item.applySyntaxHighlighting';
import item_assignLocalVar from '../Item/item.assignLocalVar';
import { item_changeText, item_addText } from '../Item/item.changeText';
import { item_collapse, item_collapseRecursive } from '../Item/item.collapse';
import item_down from '../Item/item.down';
import item_enterCommandMode from '../Item/item.enterCommandMode';
import { item_executeCommand } from '../Item/item.executeCommand';
import item_exitCommandMode from '../Item/item.exitCommandMode';
import { item_flatten, item_flatten_v2, item__flatten } from '../Item/item.flatten';
import item_focus from '../Item/item.focus';
import item_getInputLines from '../Item/item.getInputLines';
import item_getLineCount from '../Item/item.getLineCount';
import item_getLineWidthInCharacters from '../Item/item.getLineWidthInCharacters';
import item_handleBlur from '../Item/item.handleBlur';
import item_handleDotClick from '../Item/item.handleDotClick';
import item_handleDotMousedown from '../Item/item.handleDotMousedown';
import item_handleEnter from '../Item/item.handleEnter';
import item_handleKeydown from '../Item/item.handleKeydown';
import item_handleKeypress from '../Item/item.handleKeypress';
import item_handleKeyup from '../Item/item.handleKeyup';
import item_handleMousemove from '../Item/item.handleMousemove';
import item_handleMouseout from '../Item/item.handleMouseout';
import item_indent from '../Item/item.indent';
import item_isWithinZoom from '../Item/item.isWithinZoom';
import item_moveDown from '../Item/item.moveDown';
import item_moveUp from '../Item/item.moveUp';
import item_navigateSearchResults from '../Item/item.navigateSearchResults';
import item_outdent from '../Item/item.outdent';
import item_pivotItems from '../Item/item.pivotItems';
import item_refreshSortOrder from '../Item/item.refreshSortOrder';
import item_renderSearchResults from '../Item/item.renderSearchResults';
import item_showLinkButtons from '../Item/item.showLinkButtons';
import item_splitToList from '../Item/item.splitToList';
import item_template from '../Item/item.template';
import item_toHTML from '../Item/item.toHTML';
import item_toMarkdown from '../Item/item.toMarkdown';
import item_up from '../Item/item.up';

Object.assign(Item.prototype, {
  $item: item_$item,
  addChild: item_addChild,
  addNewChildBefore: item_addNewChildBefore,
  addNewChildAfter: item_addNewChildAfter,
  applyDelta: item_applyDelta,
  applyLocalStyle: item_applyLocalStyle,
  applySyntaxHighlighting: item_applySyntaxHighlighting,
  assignLocalVar: item_assignLocalVar,
  changeText: item_changeText,
  addText: item_addText,
  collapse: item_collapse,
  collapseRecursive: item_collapseRecursive,
  down: item_down,
  enterCommandMode: item_enterCommandMode,
  executeCommand: item_executeCommand,
  exitCommandMode: item_exitCommandMode,
  flatten: item_flatten,
  flatten_v2: item_flatten_v2,
  _flatten: item__flatten,
  focus: item_focus,
  getInputLines: item_getInputLines,
  getLineCount: item_getLineCount,
  getLineWidthInCharacters: item_getLineWidthInCharacters,
  handleBlur: item_handleBlur,
  handleDotClick: item_handleDotClick,
  handleDotMousedown: item_handleDotMousedown,
  handleEnter: item_handleEnter,
  handleKeydown: item_handleKeydown,
  handleKeypress: item_handleKeypress,
  handleKeyup: item_handleKeyup,
  handleMousemove: item_handleMousemove,
  handleMouseout: item_handleMouseout,
  indent: item_indent,
  isWithinZoom: item_isWithinZoom,
  moveDown: item_moveDown,
  moveUp: item_moveUp,
  navigateSearchResults: item_navigateSearchResults,
  outdent: item_outdent,
  pivotItems: item_pivotItems,
  refreshSortOrder: item_refreshSortOrder,
  renderSearchResults: item_renderSearchResults,
  showLinkButtons: item_showLinkButtons,
  splitToList: item_splitToList,
  template: item_template,
  toHTML: item_toHTML,
  toMarkdown: item_toMarkdown,
  up: item_up,
});

// --- Type 2: Side-effect modules that directly assign to Item.prototype ---
import '../Item/item.initialize';
import '../Item/item.ensureGuidsAreUnique';
import '../Item/item.events';
import '../Item/item.expand';
import '../Item/item.format';
import '../Item/item.formatNumber';
import '../Item/item.getComputed';
import '../Item/item.getTopItem';
import '../Item/item.groupItemsBy';
import '../Item/item.handleFocus';
import '../Item/item.handlePaste';
import '../Item/item.insertTextAtCursor';
import '../Item/item.render';
import '../Item/item.save';
import '../Item/item.showComputedValue';
import '../Item/item.sortItemsBy';
import '../Item/item.style';
import '../Item/item.toJSON';
import '../Item/item.ungroup';
import '../Item/item.ungroupItems';
import '../Item/item.valueOf';
import '../Item/item.zoom';
