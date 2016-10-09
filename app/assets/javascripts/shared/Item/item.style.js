calculist.require(['Item','zoomPage'], function (Item, zoomPage) {

  'use strict';

  Item.prototype.tagName = 'li';

  Item.prototype.className = function() {
    if (this.collapsed) {
      return 'collapsed';
    } else {
      return '';
    }
  };

  Item.prototype.style = 'margin-left: 20px;';

  Item.prototype.addOrRemoveClasses = function() {
    var classMap = this.classMap || (this.classMap = {});
    if (this.collapsed && !classMap.collapsed) {
      this.$el.addClass('collapsed');
      classMap.collapsed = true;
    } else if (!this.collapsed && classMap.collapsed) {
      this.$el.removeClass('collapsed');
      classMap.collapsed = false;
    }
    var isTopLevel = zoomPage.isTopOfAPage(this);
    if (isTopLevel) {
      this.$el.addClass('top-level');
      this.$('.input:first').addClass('top-level');
      this.$('.dot:first').addClass('top-level');
      classMap.topLevel = true;
    } else if (!isTopLevel && classMap.topLevel) {
      this.$el.removeClass('top-level');
      this.$('.input:first').removeClass('top-level');
      this.$('.dot:first').removeClass('top-level');
      classMap.topLevel = false;
    }
    var hasError = this.valIsComputed && _.isNaN(this.val);
    if (hasError && !classMap.error) {
      this.$('.value:first').addClass('error');
      classMap.error = true;
    } else if (!hasError && classMap.error) {
      this.$('.value:first').removeClass('error');
      classMap.error = false;
    }
    this.applySyntaxHighlighting();
  };

});
