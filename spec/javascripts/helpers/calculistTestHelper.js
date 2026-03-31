/**
 * Test helper that boots a calculist instance with real source modules
 * and minimal stubs for browser-only dependencies.
 *
 * Usage:
 *   const { createCalculist, createItemTree } = require('./helpers/calculistTestHelper');
 *   const calc = createCalculist();
 *   const parseItemText = calc.get('parseItemText');
 *   const root = createItemTree(calc, { text: 'root', items: [{ text: 'child' }] });
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const ASSETS = path.join(ROOT, 'app/assets/javascripts');
const VENDOR = path.join(ROOT, 'vendor/assets/javascripts');

// Load lodash
const _ = require(path.join(VENDOR, 'lodash/lodash'));
global._ = _;

// Load acyclic via Function to provide `this._` context.
// Direct require() fails because Node's module wrapper makes `this` !== global,
// so acyclic's `this._ || require('lodash')` hits the require() fallback which
// can't resolve bare 'lodash'.
const acyclicCode = fs.readFileSync(path.join(VENDOR, 'acyclic/acyclic.js'), 'utf8');
const acyclicModule = { exports: {} };
// The IIFE is (function(global, _) { ... })(this, this._ || require('lodash'))
// We call it with `this` set to an object that has `_` and can receive `acyclic`
const acyclicThis = { _: _ };
new Function('module', acyclicCode).call(acyclicThis, acyclicModule);
const acyclic = acyclicModule.exports;

// Load evalculist
const evalculistPath = path.join(VENDOR, 'evalculist/evalculist.js');
const evalculistCode = fs.readFileSync(evalculistPath, 'utf8');

// Source file registry — maps module names to file paths
const SOURCE_FILES = {};

function indexSourceFiles() {
  const dirs = [
    path.join(ASSETS, 'shared/utility'),
    path.join(ASSETS, 'shared/Item'),
    path.join(ASSETS, 'shared/run'),
    path.join(ASSETS, 'shared/commands'),
    path.join(ASSETS, 'client/services'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.js')) {
        SOURCE_FILES[file] = path.join(dir, file);
      }
    }
  }
}
indexSourceFiles();

/**
 * Creates a fresh calculist instance with the requested modules loaded.
 */
function createCalculist(options = {}) {
  if (global.__calculistTestInstance) return global.__calculistTestInstance;
  const graph = acyclic.new();
  const resolved = {};

  // Make calculist globally available for source files that reference it
  global.calculist = graph;
  global._ = _;
  global.window = global.window || global;

  // Stub jQuery
  const $ = function(selector) {
    return {
      text: () => '',
      html: () => '',
      addClass: () => $(selector),
      removeClass: () => $(selector),
      removeAttr: () => $(selector),
      blur: () => $(selector),
      focus: () => $(selector),
      offset: () => $(selector),
      height: () => 0,
      on: () => $(selector),
      off: () => $(selector),
      remove: () => $(selector),
      insertAfter: () => $(selector),
      attr: () => null,
      find: () => $(selector),
      append: () => $(selector),
      prepend: () => $(selector),
      empty: () => $(selector),
      val: () => '',
      length: 0,
    };
  };
  $.extend = Object.assign;

  // Stub Backbone with functional Events and View
  const BackboneEvents = {
    on: function(event, callback) { this._events = this._events || {}; this._events[event] = this._events[event] || []; this._events[event].push(callback); return this; },
    off: function(event) { if (this._events) delete this._events[event]; return this; },
    once: function(event, callback) { const self = this; const wrapped = function() { self.off(event); callback.apply(this, arguments); }; this.on(event, wrapped); return this; },
    trigger: function(event) { const args = Array.prototype.slice.call(arguments, 1); if (this._events && this._events[event]) this._events[event].forEach(function(cb) { cb.apply(null, args); }); return this; },
  };

  const BackboneView = function(options) {
    this.options = options || {};
    this.id = _.uniqueId();
    this.$el = $('<div>');
    this.$ = function(sel) { return $(sel); };
    if (this.initialize) this.initialize(options || {});
  };
  BackboneView.prototype = Object.create(BackboneEvents);
  BackboneView.prototype.constructor = BackboneView;
  BackboneView.prototype.setElement = function() { return this; };
  BackboneView.prototype.delegateEvents = function() { return this; };
  BackboneView.prototype.render = function() { return this; };
  BackboneView.prototype.renderChildren = function() { return this; };
  BackboneView.prototype.focus = function() { return this; };
  BackboneView.prototype.blurContainingList = function() { return this; };
  // Stub save to prevent infinite recursion (save calls getTopItem().save())
  BackboneView.prototype.save = function() { return this; };
  BackboneView.extend = function(protoProps) {
    const Parent = this;
    const Child = function() { return Parent.apply(this, arguments); };
    Child.prototype = Object.create(Parent.prototype);
    Child.prototype.constructor = Child;
    if (protoProps) _.extend(Child.prototype, protoProps);
    Child.extend = Parent.extend;
    return Child;
  };

  const Backbone = {
    Events: BackboneEvents,
    View: BackboneView,
    Model: function() {},
  };

  // Load evalculist — its IIFE tries module.exports first, then global
  const evalculistModule = { exports: {} };
  new Function('module', evalculistCode).call({}, evalculistModule);
  const evalculist = evalculistModule.exports;

  // Register vendor stubs
  graph.register('_', [], _.constant(_));
  graph.register('$', [], _.constant($));
  graph.register('Backbone', [], _.constant(Backbone));
  graph.register('evalculist', [], _.constant(evalculist));
  graph.register('katex', [], _.constant({ renderToString: function(s) { return s; } }));
  graph.register('ss', [], _.constant({}));
  graph.register('d3', [], _.constant({}));
  graph.register('Papa', [], _.constant({}));
  graph.register('UndoManager', [], _.constant(function() {}));
  graph.register('Promise', [], _.constant(global.Promise || function() {}));
  graph.register('Worker', [], _.constant(function() {}));
  graph.register('jsondiffpatch', [], _.constant({ create: function() { return { diff: _.noop }; } }));
  graph.register('Clipboard', [], _.constant(function() {}));
  graph.register('confetti', [], _.constant(_.noop));

  // Register eventHub (real implementation using Backbone.Events)
  graph.register('eventHub', [], function() {
    return _.extend({}, BackboneEvents);
  });

  // Stub services that depend on DOM/browser
  graph.register('computationIsPaused', [], _.constant(function() { return false; }));
  graph.register('somethingHasChanged', [], _.constant(function() { return false; }));
  graph.register('syncAnimationFrame', [], _.constant(function() { return 0; }));
  graph.register('isReadOnly', [], _.constant(function() { return false; }));
  graph.register('userIsTyping', [], _.constant(function() { return false; }));
  graph.register('editMode', [], _.constant({ is: function() { return false; } }));
  graph.register('transaction', ['_', 'eventHub'], function(_, eventHub) {
    return function(fn) { fn(); };
  });
  graph.register('itemOfDrag', [], _.constant({ get: function() { return null; }, change: _.noop, changeTarget: _.noop }));
  graph.register('replaceTeX', [], _.constant(function(s) { return s; }));
  graph.register('urlFinder', [], _.constant({ findUrls: function(s) { return s; } }));
  graph.register('slashElementsHelper', [], _.constant({ parseSlashElements: function(s) { return s; } }));
  graph.register('itemsToSVG', [], _.constant(function() { return ''; }));
  graph.register('desktopHelper', [], _.constant({ isDesktop: false }));
  graph.register('emojiHelper', [], _.constant({ parse: function(s) { return s; } }));
  graph.register('itemTagsHelper', [], _.constant({ parse: function(s) { return s; } }));
  graph.register('userPreferences', [], _.constant({ get: _.noop }));
  graph.register('customKeyboardShortcuts', [], _.constant({}));
  graph.register('saveButton', [], _.constant({ saving: _.noop, saved: _.noop, save: _.noop }));
  graph.register('commandTypeahead', [], _.constant({ show: _.noop, hide: _.noop }));

  // Load real source files
  function loadSourceFile(filename) {
    const filePath = SOURCE_FILES[filename];
    if (!filePath) throw new Error('Source file not found: ' + filename);
    const code = fs.readFileSync(filePath, 'utf8');
    // Execute in context where calculist is the global graph
    const fn = new Function('calculist', '_', code);
    fn(graph, _);
  }

  // Load utility modules
  loadSourceFile('parseUntilBalanced.js');
  loadSourceFile('getNewGuid.js');
  loadSourceFile('removeHTML.js');
  loadSourceFile('keyToVarName.js');

  // Load Item system
  loadSourceFile('itemsByGuid.js');
  loadSourceFile('Item.js');
  loadSourceFile('parseItemText.js');
  loadSourceFile('isItem.js');
  loadSourceFile('getItemByGuid.js');
  loadSourceFile('findVar.js');
  loadSourceFile('varExists.js');
  loadSourceFile('item.initialize.js');
  loadSourceFile('item.refreshSortOrder.js');
  loadSourceFile('item.assignLocalVar.js');
  loadSourceFile('item.getTopItem.js');
  loadSourceFile('item.flatten.js');
  loadSourceFile('item.toJSON.js');
  loadSourceFile('item.getComputed.js');
  loadSourceFile('item.format.js');
  loadSourceFile('item.formatNumber.js');
  loadSourceFile('item.save.js');
  loadSourceFile('computeItemValue.js');
  loadSourceFile('createComputationContextObject.js');
  loadSourceFile('item.valueOf.js');
  loadSourceFile('itemOfFocus.js');

  // Additional modules for comprehensive testing
  loadSourceFile('item.$item.js');
  loadSourceFile('item.ensureGuidsAreUnique.js');
  loadSourceFile('item.sortItemsBy.js');
  loadSourceFile('item.groupItemsBy.js');
  loadSourceFile('item.toMarkdown.js');
  loadSourceFile('item.toHTML.js');
  loadSourceFile('item.applyDelta.js');
  loadSourceFile('parseTextDoc.js');
  loadSourceFile('jsonToItemTree.js');
  loadSourceFile('calculistFileFormatter.js');
  loadSourceFile('wordWrap.js');
  loadSourceFile('keydownToString.js');
  loadSourceFile('item.indent.js');
  loadSourceFile('item.outdent.js');
  loadSourceFile('item.moveUp.js');
  loadSourceFile('item.moveDown.js');

  // Stub zoomPage (used by indent/outdent/moveUp/moveDown)
  graph.register('zoomPage', [], _.constant({ isInPage: function() { return true; } }));

  // Initialize the module graph.
  graph.init();

  // Wire named item.* methods onto Item.prototype.
  // In production, extendItemPrototype.js does this via
  // calculist.require(['Item.prototype','item'], _.extend).
  // We can't use that because 'Item.prototype' as a registered name
  // causes namespace collision with 'Item'. So we do it manually.
  var Item;
  graph.require(['Item'], function(I) { Item = I; });

  // Override save() to prevent infinite recursion in tests.
  // The real save() calls this.getTopItem().save() which recurses endlessly
  // when there's no actual server-side save mechanism.
  Item.prototype.save = function() {};
  var namedItemMethods = ['item.refreshSortOrder', 'item.assignLocalVar',
    'item.flatten', 'item.flatten_v2', 'item._flatten',
    'item.$item', 'item.applyDelta', 'item.toMarkdown', 'item.toHTML',
    'item.indent', 'item.outdent', 'item.moveUp', 'item.moveDown'];
  namedItemMethods.forEach(function(name) {
    graph.require([name], function(method) {
      if (_.isFunction(method)) {
        Item.prototype[name.split('.').pop()] = method;
      }
    });
  });

  // Provide a way to get resolved modules
  var instance = {
    get: function(name) {
      // Access the resolved module by requiring it
      var result;
      graph.require([name], function(mod) { result = mod; });
      return result;
    },
    graph: graph,
  };
  global.__calculistTestInstance = instance;
  return instance;
}

/**
 * Creates a test item tree from a simple nested object structure.
 * Example: createItemTree(calc, { text: 'root', items: [{ text: 'child' }] })
 */
function createItemTree(calc, data, parent) {
  const Item = calc.get('Item');
  const getNewGuid = calc.get('getNewGuid');
  const itemsByGuid = calc.get('itemsByGuid');

  // Clear itemsByGuid for clean state
  if (!parent) {
    Object.keys(itemsByGuid).forEach(function(k) { delete itemsByGuid[k]; });
  }

  const options = {
    text: data.text || '',
    guid: data.guid || getNewGuid(),
    parent: parent || null,
    collapsed: data.collapsed || false,
    sort_order: data.sort_order || 100,
    items: (data.items || []).map(function(child, i) {
      return Object.assign({}, child, {
        guid: child.guid || getNewGuid(),
        sort_order: child.sort_order || (i + 1) * 100,
      });
    }),
  };

  const item = new Item(options);
  if (!parent) {
    global.window = global.window || {};
    global.window.topItem = item;
  }
  return item;
}

module.exports = { createCalculist, createItemTree };
