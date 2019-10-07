calculist.register('item.renderSearchResults', ['_'], function (_) {

  var showOrHide = function (items, pattern, results, renderOps) {
    return items.reduce(function (hadMatch, item) {
      var resultsIndex = results.items.length;
      var renderOpsIndex = renderOps.length;
      var isMatch = pattern.test(item.text);
      var hasMatch = showOrHide(item.items, pattern, results, renderOps);
      if (isMatch || hasMatch) {
        if (isMatch) results.items.splice(resultsIndex, 0, item);
        renderOps.splice(renderOpsIndex, 0, function () {
          item.$el.show();
          if (hasMatch && item.collapsed) {
            item.wasCollapsed = true;
            item.collapsed = false;
            item.render();
          }
          var input = item.$('#input' + item.id);
          input.css('opacity', isMatch ? '1.0' : '0.4');
          input.removeClass('focus');
          if (isMatch) input.markRegExp(pattern);
          // The render procedure counts the number of results
          // that have been rendered in order to decide how long to delay
          // before executing the next render op.
          return +isMatch;
        });
      } else {
        renderOps.splice(renderOpsIndex, 0, function () {
          item.$el.hide();
          return 0;
        });
      }
      return isMatch || hasMatch || hadMatch;
    }, false);
  };

  var resetSearchResults = function (_this, query) {
    _this.searchResults = {
      query: query,
      items: [],
      selectionIndex: -1
    };
  };

  var currentQuery;
  return function (query) {
    var begin = window.performance.now();
    currentQuery = query;
    if (!query && !this.searchResults) return;
    if (!query) {
      resetSearchResults(this, query);
      this.items.forEach(function (item) { item.$el.hide(); });
      return;
    }
    if (this.searchResults && this.searchResults.query === query) return;
    resetSearchResults(this, query);
    var pattern = new RegExp(_.escapeRegExp(query), 'i');
    var renderOps = [];
    this.$el.unmark();
    showOrHide(this.items, pattern, this.searchResults, renderOps);
    var _this = this;
    var renderCount = 0;
    var minRenderCountBeforeDelay = 10;
    var previousRenderCount = renderCount;
    var delay = 10;
    var delayThreshold = 20;
    var maxDelay = 100;
    var initialPromise = new Promise(function (resolve, reject) {
      var initialDelay = 10;
      if (query.length === 1) initialDelay = 1000;
      if (query.length === 2) initialDelay = 100;
      _.delay(function () {
        if (_this.mode === 'search' && currentQuery === query) {
          resolve(window.performance.now());
        } else {
          reject("'" + _this.mode + "' !== 'search' || '" + currentQuery + "' !== '" + query + "'");
        }
      }, initialDelay);
    })
    var promise = renderOps.reduce(function (promise, f) {
      return promise.then(function (startTime) {
        if (_this.mode !== 'search') return Promise.reject('not in search mode');
        if (renderCount > 1000) return Promise.reject('too many results');
        var elapsedTime = window.performance.now() - startTime;
        if (
          elapsedTime > delayThreshold &&
          renderCount > previousRenderCount &&
          renderCount > minRenderCountBeforeDelay
        ) {
          // In order not to block the UI and do unnecessary rendering while
          // the user is still typing, we render in timed chunks with some delay
          // in between so we can check to see if the query has changed.
          // If it has changed, we abort rendering the stale results
          // in order to allow the updated results to render instead.
          // We also abort if we have exited search mode.
          console.log(query + ", " + elapsedTime + " > 20 and renderCount == " + renderCount);
          return new Promise(function (resolve, reject) {
            _.delay(function () {
              if (_this.mode === 'search' && currentQuery === query) {
                var startTime = window.performance.now();
                previousRenderCount = renderCount;
                renderCount += f();
                resolve(startTime);
              } else {
                reject("'" + _this.mode + "' !== 'search' || '" + currentQuery + "' !== '" + query + "'");
              }
            }, delay);
            delay = Math.min(delay + 10, maxDelay);
          });
        } else if (currentQuery === query) {
          previousRenderCount = renderCount;
          renderCount += f();
          return startTime;
        } else {
          return Promise.reject("'" + currentQuery + "' !== '" + query + "'");
        }
      });
    }, initialPromise);
    promise.then(function () {
      console.log('completed render for "' + query + '" in ' + (window.performance.now() - begin) + ' milliseconds');
    });
  };

});
