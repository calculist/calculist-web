calculist.require(['Item','_'], function (Item, _) {

  'use strict';

  Item.prototype.render = function() {
    this.undelegateEvents();
    var templateData = {
      id: this.id,
      text: this.getComputedHTML(),
      collapsed: this.collapsed
    };
    this.$el.html(this.template(templateData));
    this.addOrRemoveClasses();
    this.renderChildren();
    this.delegateEvents();
    return this;
  };

  Item.prototype.renderChildren = function() {
    var listEl = this.$("#list" + this.id);
    listEl.html('');
    if (!this.collapsed) {
      _.each(this.$items, function(child) {
        listEl.append(child.render().el);
      });
    }
  };

  Item.prototype.softRender = function() {
    if (this.valIsComputed) {
      this.showComputedValue();
    } else if (this.computedDisplayIsVisible) {
      this.$("#computed-display" + this.id).text('');
      this.computedDisplayIsVisible = false;
    }
    this.addOrRemoveClasses();
    if (!this.collapsed) {
      _.each(this.$items, _.method('softRender'));
    }
  };

  Item.prototype.softRenderAll = function() {
    this.getTopItem().softRender();
  };

});
