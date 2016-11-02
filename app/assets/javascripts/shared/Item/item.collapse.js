calculist.register('item.collapse',['Promise','_','transaction'], function (Promise, _, transaction) {

  return function(skipAnimation) {
    var _this = this;
    return new Promise(function (resolve) {
      var $list, height;
      if (_this.collapsed || _this.$items.length === 0 || sessionStorage.zoomGuid === _this.guid) {
        return resolve();
      }
      _this.collapsed = true;
      _this.$el.addClass('collapsed');
      _this.$('#dot' + _this.id).addClass('collapsed');
      $list = _this.$("#list" + _this.id);
      if (skipAnimation) {
        $list.height(0);
        _this.renderChildren();
        return resolve();
      }
      $list.css({
        overflow: 'hidden'
      });
      height = $list.height();
      $list.height(height);
      window.requestAnimationFrame(function() {
        $list.on('transitionend',function() {
          $list.off('transitionend');
          $list.css({
            overflow: 'visible'
          });
          _this.renderChildren();
          resolve();
        });
        $list.height(0);
      });
    });
  };

});

calculist.register('item.collapseRecursive',['Promise','_','transaction'], function (Promise, _, transaction) {

  return function (isTreeTop) {
    var _this = this,
        promise = Promise.all(_this.$items.map(_.method('collapseRecursive'))).then(function () {
          return _this.collapse();
        });
    if (isTreeTop === true) {
      transaction.stall();
      promise.then(transaction.end).catch(transaction.end);
    }
    return promise;
  };

});
