calculist.require(['Item','_','$','lmSessionStorage','zoomPage'], function (Item, _, $, lmSessionStorage, zoomPage) {

  Item.prototype.zoomIn = function(options) {
    options || (options = {});
    if (this.alreadyZoomedIn && !options.zoomOut) return;
    lmSessionStorage.set('zoomGuid', this.guid);
    this.alreadyZoomedIn = true;
    // $('#top-level').html('').append(this.render().$el);
    if (this.collapsed) {
      this.expand();
    }
    if (options.zoomOut) {
      var item = this.$item(lmSessionStorage.get('focusGuid'), 'guid');
      if (item) item.focus();
    } else {
      if (options.focus !== false) this.focus();
      if (this.$parent) zoomPage.attach(this);
      // this.$el.addClass('page');
    }
  };

  Item.prototype.zoomOut = function() {
    if (lmSessionStorage.get('zoomGuid') === this.guid) {
      // this.$el.removeClass('page');
      // lmSessionStorage.set('zoomGuid', '');
      zoomPage.detach(this);
      this.alreadyZoomedIn = false;
      this.getTopItem().zoomIn({
        zoomOut: true
      });
    } else {
      this.$parent.zoomOut();
    }
  };

});
