calculist.register('Item', ['_','Backbone','$','getNewGuid','eventHub'], function (_, Backbone, $, getNewGuid, eventHub) {

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
      nextChildren = this.items;
      while (!(item || nextChildren.length === 0)) {
        children = nextChildren;
        if (children.length) {
          nextChildren = [];
          item = _.findLast(children, function(child) {
            if (child[attributeName] === key) {
              return true;
            } else {
              nextChildren.unshift.apply(nextChildren, child.items);
              return false;
            }
          });
        }
      }
      return item;
    };

    Item.prototype.$$item = function(key) {
      if (!this.$parent) return;
      var items = this.$parent.items;
      var i = items.indexOf(this);
      while (--i >= 0) {
        if (items[i].key === key) return items[i];
      }
      if (this.$parent.key === key) return this.$parent;
      return this.$parent.$$item(key);
    };

    Item.prototype.$siblings = function() {
      var _this = this;
      return _.filter(this.$parent.items, function(item) {
        return item !== _this;
      });
    };

    Item.prototype.getTotalItemCount = function() {
      return this.items.reduce(function(count, item) {
        return count + 1 + item.getTotalItemCount();
      }, 0);
    };

    Item.prototype.showTrueValue = function() {
      this.$("#input" + this.id).text(this.text);
    };

    Item.prototype.toggleCollapse = function() {
      if (!this.items.length) {
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
      i = this.items.indexOf(child);
      if (i === -1) {
        return;
      }
      item = this.items[--i];
      return item;
    };

    Item.prototype.getNextSibling = function(child) {
      var i, item;
      if (!child) {
        return this.items[0];
      }
      i = this.items.indexOf(child);
      if (i === -1) {
        return;
      }
      item = this.items[++i];
      return item;
    };

    Item.prototype.getUpperItemAtDepth = function(child, depth, includeCollapsed) {
      var findItem, item, upperSibling, _ref;
      upperSibling = this.getUpperSibling(child);
      if (!upperSibling) {
        return (_ref = this.$parent) != null ? _ref.getUpperItemAtDepth(this, depth) : void 0;
      } else if (upperSibling.depth === depth) {
        return upperSibling;
      } else if (upperSibling.items.length === 0 || (upperSibling.collapsed && !includeCollapsed)) {
        return this.getUpperItemAtDepth(upperSibling, depth);
      }
      item = (findItem = function(items) {
        var i, _ref1;
        i = items.length;
        if (((_ref1 = items[0]) != null ? _ref1.depth : void 0) < depth) {
          while (--i >= 0) {
            item = items[i];
            if (item.items.length && (includeCollapsed || !item.collapsed)) {
              item = findItem(item.items);
              if (item) {
                return item;
              }
            }
          }
        } else {
          return items[i - 1];
        }
      })(upperSibling.items);
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
      } else if (nextSibling.items.length === 0 || (nextSibling.collapsed && !includeCollapsed)) {
        return this.getNextItemAtDepth(nextSibling, depth);
      }
      item = (findItem = function(items) {
        var i, _ref1;
        i = -1;
        if (((_ref1 = items[0]) != null ? _ref1.depth : void 0) < depth) {
          while (++i < items.length) {
            item = items[i];
            if (item.items.length && (includeCollapsed || !item.collapsed)) {
              item = findItem(item.items);
              if (item) {
                return item;
              }
            }
          }
        } else {
          return items[0];
        }
      })(nextSibling.items);
      if (item) {
        return item;
      } else {
        return this.getNextItemAtDepth(nextSibling, depth);
      }
    };

    Item.prototype.removeChild = function(child) {
      _.pull(this.items, child);
    };

    Item.prototype.insertAt = function(child, i) {
      this.items.splice(i, 0, child);
      child.$parent = this;
      child.refreshSortOrder();
    };

    Item.prototype.insertAfter = function(child, otherChild) {
      var i;
      i = this.items.indexOf(otherChild);
      if (i === -1) {
        return false;
      }
      this.items.splice(i + 1, 0, child);
      child.refreshSortOrder();
      return true;
    };

    Item.prototype.insertBefore = function(child, otherChild) {
      var i;
      i = this.items.indexOf(otherChild);
      if (i === -1) {
        return;
      }
      this.items.splice(i, 0, child);
      child.refreshSortOrder();
    };

    Item.prototype.refreshDepth = function() {
      this.depth = ((this.$parent || {}).depth || 0) + 1;
      var _this = this;
      var lastSortOrder = 0;
      _.each(this.items, function (item, i) {
        item.$parent = _this;
        item.refreshDepth();
        if (item.sort_order == null || item.sort_order <= lastSortOrder) item.refreshSortOrder();
        lastSortOrder = item.sort_order;
      });
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
      if ((hideCollapsed && this.collapsed) || this.items.length === 0) {
        nestedText = '';
      } else {
        nestedText = _.map(this.items, _.method('toText', depth + 2, computed, hideCollapsed)).join('');
      }
      return _.repeat(' ', depth) + _.trim(text) + '\n' + nestedText;
    };

    Item.prototype.deleteItem = function(youAreSure) {
      if (youAreSure || this.items.length === 0) {
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

  return Item;

});
