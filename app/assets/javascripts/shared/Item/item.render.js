calculist.require(['Item','_','itemOfFocus'], function (Item, _, itemOfFocus) {

  'use strict';

  Item.prototype.render = function (unrenderFirst) {
    if (unrenderFirst) {
      this.unrender();
    } else {
      this.undelegateEvents();
    }
    var templateData = {
      id: this.id,
      text: this.getComputedHTML(),
      collapsed: this.collapsed,
      focus: itemOfFocus.is(this)
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

  Item.prototype.softRender = function() {
    if (this.valIsComputed) {
      this.showComputedValue();
    } else if (this.computedDisplayIsVisible) {
      this.$("#computed-display" + this.id).text('');
      this.computedDisplayIsVisible = false;
    }
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
