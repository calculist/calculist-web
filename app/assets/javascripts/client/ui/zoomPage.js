calculist.register('zoomPage',['_','$','Promise','lmSessionStorage','getItemByGuid','undoManager','eventHub'], function (_, $, Promise, lmSessionStorage, getItemByGuid, undoManager, eventHub) {

  var stack = [];
  var $page;
  var dimensionAttrs = ['offset','width','height'];
  var originalDimensions;
  var $standin;
  var zooming = false;

  var applyOriginalDimensions = function () {
    _.each(dimensionAttrs, function (attr) {
      $page[attr](originalDimensions[attr]);
    });
  };

  var getPageClickHandler = function ($page, topItem) {
    return function (e) {
      if (e.target != $page[0]) return;
      var lastItem = _.last(topItem.items);
      if (!lastItem) {
        topItem.addChild('');
      } else {
        while (!lastItem.collapsed && lastItem.items.length) lastItem = _.last(lastItem.items);
        lastItem.focus();
      }
    }
  };

  $(function () {
    var $mp = $('.main-page');
    var clickHandler = null;
    $mp.on('click', function (e) {
      // Waiting to set handler until after window.topItem has been initialized.
      clickHandler || (clickHandler = getPageClickHandler($mp, window.topItem));
      clickHandler(e);
    });

    var heightChangeHandler = _.debounce(function() {
      if (zooming || stack.length === 0) return;
      // console.log("checking zoom page heights on " + stack.length + " page" + (stack.length === 1 ? ". " : "s. ") + performance.now());
      _.forEachRight(stack, function (p, i) {
        var $page0 = i == 0 ? $mp : stack[i - 1].$page;
        var $page1 = p.$page;
        var height = $page1.height();
        if ($page0.height() != height + 20) {
          // console.log('updating page height');
          $page0.height(height + 20);
        }
      });
    }, 10);

    $(window).on('transitionend', heightChangeHandler);
    eventHub.on('transactionend', heightChangeHandler);
    eventHub.on('zoomPageHeightChange', heightChangeHandler);
  });

  var zoomPage = {
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
    getZoomDepth: function () { return stack.length; },
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
      zooming = true;
      $page = $('<div class="page zoom-page" style="position: absolute;"></div>');
      $page.on('click', getPageClickHandler($page, item));
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
            zooming = false;
            eventHub.trigger('zoomPageHeightChange');
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
      zooming = true;
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
          $mainPage.height('auto');
          originalDimensions = nextPageData.originalDimensions;
          $standin = nextPageData.$standin;
          lmSessionStorage.set('zoomGuid', (nextPageData.item || window.topItem).guid);
          var focusItem = getItemByGuid(lmSessionStorage.get('focusGuid'));
          if (focusItem) focusItem.focus();
          zooming = false;
          eventHub.trigger('zoomPageHeightChange');
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
  return zoomPage;
});
// 162, 302.5
// 172, 296.5
