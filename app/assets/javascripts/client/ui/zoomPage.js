calculist.register('zoomPage',['_','$','Promise','lmSessionStorage','getItemByGuid','undoManager'], function (_, $, Promise, lmSessionStorage, getItemByGuid, undoManager) {

  var stack = [],
      $page,
      dimensionAttrs = ['offset','width','height'],
      originalDimensions, $standin;

  var applyOriginalDimensions = function () {
    _.each(dimensionAttrs, function (attr) {
      $page[attr](originalDimensions[attr]);
    });
  };

  return {
    isTopOfAPage: function (item) {
      return _.some(stack, function (data) { return data.item === item; }) || !item.parent;
    },
    getTopItem: function () {
      var topItem = (_.last(stack) || {}).item || window.topItem;
      return topItem;
    },
    getLastVisibleItem: function () {
      var topItem = this.getTopItem(),
          lastItem = _.last(topItem.items) || topItem;
      while (!lastItem.collapsed && lastItem.items.length) {
        lastItem = _.last(lastItem.items);
      }
      return lastItem;
    },
    isInPage: function (item) {
      var topItem = (_.last(stack) || {}).item;
      if (!topItem || item === topItem) return true;
      if (item.depth <= topItem.depth) return false;
      var parent = item.parent;
      while (parent && parent.depth >= topItem.depth) {
        if (parent === topItem) return true;
        parent = parent.parent;
      }
      return false;
    },
    attach: function (item) {
      $page = $('<div class="page zoom-page"></div>');
      originalDimensions = dimensionAttrs.reduce(function (dimensions, attr) {
        dimensions[attr] = item.$el[attr]();
        return dimensions;
      }, {});
      $standin = $('<li></li>').height(originalDimensions.height);
      stack.push({
        $page: $page,
        item: item,
        originalDimensions: originalDimensions,
        $standin: $standin
      });
      item.$el.replaceWith($standin);
      applyOriginalDimensions();
      var $mainPage = (stack[stack.length - 2] || {}).$page || $('.main-page');
      // _.each(dimensionAttrs, function (attr) {
      //   $page[attr]($mainPage[attr]());
      // });
      $('#main-container').append($page.html('').append(item.render().el));
      window.requestAnimationFrame(function () {
        // item.addOrRemoveClasses(true);
        item.$('.input-container:first').addClass('top-level');
        item.$('.input:first').addClass('top-level');
        item.$('.dot:first').addClass('top-level');
        item.$('ul:first').addClass('top-level');
        var mainPageOffset = $mainPage.offset();
        $page.offset({
          top: mainPageOffset.top + 10,
          left: mainPageOffset.left + 10
        });
        $page.width($mainPage.width() - 10 * 2);
        $page.height($mainPage.height() - 10 * 2);
        $page.css({
          opacity: 1
        });
        item.focus();
        lmSessionStorage.set('zoomGuid', item.guid);
        $page.on('transitionend', function () {
          $page.css({
            minHeight: $page.height(),
            left: 'calc(50% - ' + $page.width() + 'px / 2 - 10px)'
          }).off('transitionend');
          item.focus();
          _.delay(function () {
            $page.css({ height: 'auto' });
          }, 200);
        });
      });
      undoManager.add({
        redo: function () {
          item.zoomIn();
        },
        undo: function () {
          item.zoomOut();
        }
      });
    },
    detach: function () {
      var pageData = stack.pop();
      return new Promise(function (resolve) {
        if (!pageData) return resolve();
        $page = pageData.$page;
        $standin = pageData.$standin;
        // TODO clean up old variable names so this is not so confusing
        originalDimensions = dimensionAttrs.reduce(function (dimensions, attr) {
          dimensions[attr] = $standin[attr]();
          if (attr === 'offset') {
            dimensions[attr].top -= 10;
            dimensions[attr].left += 10;
          }
          return dimensions;
        }, {});
        applyOriginalDimensions();
        var nextPageData = _.last(stack) || {};
        var $mainPage = nextPageData.$page || $('.main-page');
        $page.css({
          width: 800 - originalDimensions.left - 200
        });
        pageData.item.$('.input-container:first').removeClass('top-level');
        pageData.item.$('.input:first').removeClass('top-level');
        pageData.item.$('.dot:first').removeClass('top-level');
        pageData.item.$('ul:first').removeClass('top-level');
        $page.on('transitionend', function () {
          $page.off('transitionend');
          $standin.replaceWith(pageData.item.render(true).el);
          $page.remove();
          originalDimensions = nextPageData.originalDimensions;
          $standin = nextPageData.$standin;
          lmSessionStorage.set('zoomGuid', (nextPageData.item || window.topItem).guid);
          var focusItem = getItemByGuid(lmSessionStorage.get('focusGuid'));
          if (focusItem) focusItem.focus();
          resolve();
        });

        // NOTE this has no effect if it is called within the undo of a zoomIn
        undoManager.add({
          redo: function () {
            pageData.item.zoomOut();
          },
          undo: function () {
            pageData.item.zoomIn();
          }
        });
      });
    }
  };
});
// 162, 302.5
// 172, 296.5
