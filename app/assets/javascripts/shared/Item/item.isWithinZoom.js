calculist.register('item.isWithinZoom', ['lmSessionStorage'], function (lmSessionStorage) {

  return function () {
    var zoomGuid = lmSessionStorage.get('zoomGuid');
    if (!zoomGuid || zoomGuid === this.guid) {
      return true;
    } else {
      var nextParent = this.$parent;
      while (nextParent) {
        if (nextParent.guid === zoomGuid) return true;
        nextParent = nextParent.$parent;
      }
      return false;
    }
  };

});
