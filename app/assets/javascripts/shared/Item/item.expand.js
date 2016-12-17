calculist.require(['Item','Promise','_','transaction'], function (Item, Promise, _, transaction) {

  Item.prototype.expand = function (expandParents, skipRender) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      try {
        if (_this.collapsed) {
          var expandList = function () {
            _this.collapsed = false;
            _this.$el.removeClass('collapsed');
            _this.$('#dot' + _this.id).removeClass('collapsed');
            if (!skipRender) _this.renderChildren();
            var $list = _this.$("#list" + _this.id);
            $list.css({
              overflow: 'hidden'
            });
            $list.height('initial');
            var height = $list.height();
            $list.height(0);
            window.requestAnimationFrame(function() {
              $list.on('transitionend', function() {
                $list.off('transitionend');
                $list.height('initial');
                $list.css({
                  overflow: 'visible'
                });
                resolve();
              });
              $list.height(height);
            });
          };
          if (expandParents) {
            var nextParent = _this.$parent;
            var collapsedParents = null;
            while (nextParent) {
              if (nextParent.collapsed) {
                (collapsedParents || (collapsedParents = [])).unshift(nextParent);
              }
              nextParent = nextParent.$parent;
            }
            if (collapsedParents) {
              var expandNext = function () {
                return collapsedParents.shift().expand().then(function () {
                  if (collapsedParents.length) return expandNext();
                  return expandList();
                });
              };
              expandNext();
            } else {
              expandList();
            }
          } else {
            expandList();
          }
        } else {
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  Item.prototype.expandRecursive = function (isTreeTop) {
    var _this = this;
    var promise = _this.expand().then(function () {
      return Promise.all(_this.items.map(_.method('expandRecursive')));
    });
    if (isTreeTop === true) {
      transaction.stall();
      promise.then(transaction.end).catch(transaction.end);
    }
    return promise;
  };

});
