lm.register('item.applyDelta', ['_','getItemByGuid'], function (_, getItemByGuid) {

  return function (delta) {
    // console.log('delta', delta);
    if (!delta) return;
    var _this = this;
    _.each(delta, function (val, key) {
      if (key == '$items') {
        _this.$items = val[1].split(',').reduce(function (items, guid) {
          if (!guid) return items;
          var item = getItemByGuid(guid);
          if (!item) throw new Error('cannot find item with guid ' + guid);
          item.$parent = _this;
          item.refreshDepth();
          items.push(item);
          return items;
        }, []);
      } else {
        _this[key] = val[1];
      }
    });
    _.defer(function () {
      _this.render();
    });
  };

});
