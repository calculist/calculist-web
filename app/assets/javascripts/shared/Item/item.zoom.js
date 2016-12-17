calculist.require(['Item','_','$','lmSessionStorage','zoomPage'], function (Item, _, $, lmSessionStorage, zoomPage) {

  Item.prototype.zoomIn = function(options) {
    options || (options = {});
    if (this.alreadyZoomedIn && !options.zoomOut) return;
    lmSessionStorage.set('zoomGuid', this.guid);
    this.alreadyZoomedIn = true;
    if (this.collapsed) {
      this.wasCollapsed = true;
      this.expand();
    }
    if (options.zoomOut) {
      var item = this.$item(lmSessionStorage.get('focusGuid'), 'guid');
      if (item) item.focus();
    } else {
      if (options.focus !== false) this.focus();
      if (this.parent) zoomPage.attach(this);
    }
  };

  Item.prototype.zoomOut = function() {
    if (lmSessionStorage.get('zoomGuid') === this.guid) {
      var _this = this;
      zoomPage.detach(this).then(function () {
        if (_this.wasCollapsed) {
          _this.wasCollapsed = false;
          _this.collapse(true).then(function () {
            _this.focus();
          });
        }
      });
      this.alreadyZoomedIn = false;
      this.getTopItem().zoomIn({
        zoomOut: true
      });
    } else {
      this.parent.zoomOut();
    }
  };

});
