calculist.require(['Item','_','itemOfFocus'], function (Item, _, itemOfFocus) {

  'use strict';

  Item.prototype.render = function (unrenderFirst) {
    if (unrenderFirst) {
      this.unrender();
    } else {
      this.undelegateEvents();
    }
    var isFocused = itemOfFocus.is(this);
    var templateData = {
      id: this.id,
      text: isFocused ? _.escape(this.text) : this.getComputedHTML(),
      collapsed: this.collapsed,
      focus: isFocused
    };
    this.$el.html(this.template(templateData));
    this.addOrRemoveClasses();
    this.applyLocalStyle();
    this.renderChildren();
    this.delegateEvents();
    return this;
  };

  Item.prototype.renderChildren = function() {
    if (this.collapsed) {
      this.unrenderChildren();
    } else {
      var listEl = this.$("#list" + this.id);
      listEl.html(_.map(this.items, function(child) {
        return child.render(true).el;
      }));
    }
  };

  Item.prototype.unrender = function () {
    this.undelegateEvents();
    this.$el.remove();
    this.unrenderChildren();
  };

  var callUnrender = _.method('unrender');
  Item.prototype.unrenderChildren = function () {
    var listEl = this.$("#list" + this.id);
    if (listEl.children().length > 0) _.each(this.items, callUnrender);
  };

  Item.prototype.softRenderRequiresCompute = function () {
    return this.valIsComputed || /\\(?:\.|lookup)/.test(this.text);
  }

  Item.prototype.softRender = function() {
    if (this.softRenderRequiresCompute()) {
      this.showComputedValue();
    } else if (this.computedDisplayIsVisible) {
      this.$("#computed-display" + this.id).text('');
      this.computedDisplayIsVisible = false;
    }
    this.showLinkButtons();
    this.addOrRemoveClasses();
    this.applyLocalStyle();
    if (!this.collapsed) {
      _.each(this.items, _.method('softRender'));
    }
  };

  Item.prototype.softRenderAll = function() {
    this.getTopItem().softRender();
  };

});
