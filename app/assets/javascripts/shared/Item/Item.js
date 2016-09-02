lm.register('Item', ['_','Backbone','$','ss','Papa','getNewGuid','jsonToItemTree','item.protoMethods','eventHub','isReadOnly'], function (_, Backbone, $, ss, Papa, getNewGuid, jsonToItemTree, protoMethods, eventHub, isReadOnly) {

  'use strict';

  var Item, log,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  log = _.bind(console['log'], console);

  Item = (function(_super) {
    __extends(Item, _super);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.$lastItem = function(key, attributeName) {
      var children, item, nextChildren;
      if (attributeName == null) {
        attributeName = 'key';
      }
      item = null;
      nextChildren = this.$items;
      while (!(item || nextChildren.length === 0)) {
        children = nextChildren;
        if (children.length) {
          nextChildren = [];
          item = _.findLast(children, function(child) {
            if (child[attributeName] === key) {
              return true;
            } else {
              nextChildren.unshift.apply(nextChildren, child.$items);
              return false;
            }
          });
        }
      }
      return item;
    };

    Item.prototype.$$item = function(key) {
      if (!this.$parent) return;
      var items = this.$parent.$items;
      var i = items.indexOf(this);
      while (--i >= 0) {
        if (items[i].key === key) return items[i];
      }
      if (this.$parent.key === key) return this.$parent;
      return this.$parent.$$item(key);
    };

    Item.prototype.$siblings = function() {
      var _this = this;
      return _.filter(this.$parent.$items, function(item) {
        return item !== _this;
      });
    };

    Item.prototype.getTotalItemCount = function() {
      return this.$items.reduce(function(count, item) {
        return count + 1 + item.getTotalItemCount();
      }, 0);
    };

    Item.prototype.showTrueValue = function() {
      this.$("#input" + this.id).text(this.text);
    };

    Item.prototype.toggleCollapse = function() {
      if (!this.$items.length) {
        return;
      }
      if (this.collapsed) {
        this.expand(true);
      } else {
        this.collapse();
      }
      this.save();
      this.focus();
    };

    Item.prototype.getUpperSibling = function(child) {
      var i, item;
      i = this.$items.indexOf(child);
      if (i === -1) {
        return;
      }
      item = this.$items[--i];
      return item;
    };

    Item.prototype.getNextSibling = function(child) {
      var i, item;
      if (!child) {
        return this.$items[0];
      }
      i = this.$items.indexOf(child);
      if (i === -1) {
        return;
      }
      item = this.$items[++i];
      return item;
    };

    Item.prototype.getUpperItemAtDepth = function(child, depth, includeCollapsed) {
      var findItem, item, upperSibling, _ref;
      upperSibling = this.getUpperSibling(child);
      if (!upperSibling) {
        return (_ref = this.$parent) != null ? _ref.getUpperItemAtDepth(this, depth) : void 0;
      } else if (upperSibling.depth === depth) {
        return upperSibling;
      } else if (upperSibling.$items.length === 0 || (upperSibling.collapsed && !includeCollapsed)) {
        return this.getUpperItemAtDepth(upperSibling, depth);
      }
      item = (findItem = function(items) {
        var i, _ref1;
        i = items.length;
        if (((_ref1 = items[0]) != null ? _ref1.depth : void 0) < depth) {
          while (--i >= 0) {
            item = items[i];
            if (item.$items.length && (includeCollapsed || !item.collapsed)) {
              item = findItem(item.$items);
              if (item) {
                return item;
              }
            }
          }
        } else {
          return items[i - 1];
        }
      })(upperSibling.$items);
      if (item) {
        return item;
      } else {
        return this.getUpperItemAtDepth(upperSibling, depth);
      }
    };

    Item.prototype.getNextItemAtDepth = function(child, depth, includeCollapsed) {
      var findItem, item, nextSibling, _ref;
      nextSibling = this.getNextSibling(child);
      if (!nextSibling) {
        return (_ref = this.$parent) != null ? _ref.getNextItemAtDepth(this, depth) : void 0;
      } else if (nextSibling.depth === depth) {
        return nextSibling;
      } else if (nextSibling.$items.length === 0 || (nextSibling.collapsed && !includeCollapsed)) {
        return this.getNextItemAtDepth(nextSibling, depth);
      }
      item = (findItem = function(items) {
        var i, _ref1;
        i = -1;
        if (((_ref1 = items[0]) != null ? _ref1.depth : void 0) < depth) {
          while (++i < items.length) {
            item = items[i];
            if (item.$items.length && (includeCollapsed || !item.collapsed)) {
              item = findItem(item.$items);
              if (item) {
                return item;
              }
            }
          }
        } else {
          return items[0];
        }
      })(nextSibling.$items);
      if (item) {
        return item;
      } else {
        return this.getNextItemAtDepth(nextSibling, depth);
      }
    };

    Item.prototype.removeChild = function(child) {
      _.pull(this.$items, child);
    };

    Item.prototype.insertAt = function(child, i) {
      this.$items.splice(i, 0, child);
      child.$parent = this;
      child.refreshSortOrder();
    };

    Item.prototype.insertAfter = function(child, otherChild) {
      var i;
      i = this.$items.indexOf(otherChild);
      if (i === -1) {
        return false;
      }
      this.$items.splice(i + 1, 0, child);
      child.refreshSortOrder();
      return true;
    };

    Item.prototype.insertBefore = function(child, otherChild) {
      var i;
      i = this.$items.indexOf(otherChild);
      if (i === -1) {
        return;
      }
      this.$items.splice(i, 0, child);
      child.refreshSortOrder();
    };

    Item.prototype.refreshDepth = function() {
      this.depth = ((this.$parent || {}).depth || 0) + 1;
      var _this = this;
      if (this.$items[0]) this.$items[0].refreshSortOrder();
      _.each(this.$items, function (item, i) {
        item.$parent = _this;
        item.refreshDepth();
        if (item.sort_order == null) item.refreshSortOrder();
      });
    };

    Item.prototype.indent = function() {
      // TODO Prevent indenting and outdenting on top zoom items
      var newParent, _ref;
      newParent = this.$parent.getUpperSibling(this);
      if (!newParent) {
        return;
      }
      this.$parent.removeChild(this);
      this.$parent = newParent;
      this.$parent.$items.push(this);
      this.refreshDepth();
      (((_ref = this.$parent) != null ? _ref.$parent : void 0) || this.$parent).renderChildren();
      this.save();
      if (this.$parent.collapsed) {
        this.$parent.toggleCollapse();
      }
      this.refreshSortOrder();
      this.focus();
    };

    Item.prototype.outdent = function() {
      var newParent, previousParent;
      previousParent = this.$parent;
      newParent = previousParent.$parent;
      if (!newParent) {
        return;
      }
      this.$parent = newParent;
      this.$parent.insertAfter(this, previousParent);
      previousParent.removeChild(this);
      this.refreshDepth();
      this.$parent.renderChildren();
      if (this.$parent.collapsed) {
        this.$parent.toggleCollapse();
      }
      this.refreshSortOrder();
      this.save();
      this.focus();
    };

    Item.prototype.focus = function() {
      // if (this.hasFocus) return; // BUG Refactor this.hasFocus. It's buggy. Breaks keyboard shortcuts and other things.
      var $input = this.$("#input" + this.id);
      if (isReadOnly()) {
        $input.addClass('focus');
      } else {
        $input.focus();
      }
    };

    Item.prototype.moveChildUp = function(child) {
      var nextUp, nextUpParent;
      nextUp = this.getUpperSibling(child);
      if (nextUp) {
        this.removeChild(child);
        this.insertBefore(child, nextUp);
        if (this.collapsed) {
          this.toggleCollapse;
        }
        this.renderChildren();
      } else {
        nextUpParent = this.$parent.getUpperItemAtDepth(this, this.depth, true);
        if (!nextUpParent) {
          return;
        }
        this.removeChild(child);
        child.$parent = nextUpParent;
        nextUpParent.$items.push(child);
        if (nextUpParent.collapsed) {
          nextUpParent.toggleCollapse();
        }
        nextUpParent.render();
      }
      child.refreshSortOrder();
      child.focus();
    };

    Item.prototype.moveUp = function() {
      this.$parent.moveChildUp(this);
      this.save();
    };

    Item.prototype.moveChildDown = function(child) {
      var nextParent, nextSibling;
      nextSibling = this.getNextSibling(child);
      if (nextSibling) {
        this.removeChild(child);
        this.insertAfter(child, nextSibling);
        this.renderChildren();
      } else {
        nextParent = this.$parent.getNextItemAtDepth(this, this.depth, true);
        if (!nextParent) {
          return;
        }
        this.removeChild(child);
        child.$parent = nextParent;
        nextParent.$items.unshift(child);
        if (nextParent.collapsed) {
          nextParent.toggleCollapse();
        }
        nextParent.render();
      }
      child.refreshSortOrder();
      child.focus();
    };

    Item.prototype.moveDown = function() {
      this.$parent.moveChildDown(this);
      this.save();
    };

    Item.prototype.clone = function(parent) {
      var options;
      options = this.toClonedJSON();
      options.guid = getNewGuid();
      options.$parent = parent;
      return new Item(options);
    };

    Item.prototype.toText = function(depth, computed, hideCollapsed) {
      eventHub.trigger('somethingHasChanged');
      var nestedText, text;
      if (!depth) depth = 0;
      if (computed !== false) computed = true;
      text = computed ? this.getComputedText() : this.text;
      if ((hideCollapsed && this.collapsed) || this.$items.length === 0) {
        nestedText = '';
      } else {
        nestedText = _.map(this.$items, _.method('toText', depth + 2, computed, hideCollapsed)).join('');
      }
      return _.repeat(' ', depth) + _.trim(text) + '\n' + nestedText;
    };

    Item.prototype.deleteItem = function(youAreSure) {
      if (youAreSure || this.$items.length === 0) {
        var nextUp = this.$parent.getUpperSibling(this) || this.$parent;
        this.$parent.removeChild(this);
        this.$parent.renderChildren();
        nextUp.focus();
        this.save();
        return true;
      }
    };

    return Item;

  })(Backbone.View);

  lm.require(protoMethods.map(function (m) { return 'item.' + m; }), function () {
    _.each(arguments, function (fn, i) {
      var methodName = protoMethods[i];
      Item.prototype[methodName] = function () {
        eventHub.trigger('item.' + methodName + ':before', this, arguments);
        var returnValue = fn.apply(this, arguments);
        eventHub.trigger('item.' + methodName, this, arguments, returnValue);
        return returnValue;
      };
    });
  });

  return Item;

});
