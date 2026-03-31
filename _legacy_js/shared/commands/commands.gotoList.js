calculist.register('commands.gotoList', ['_'], function (_) {
  return function (_this, listTitle) {
    if (!window.LIST_ID /* desktop app */) return;
    listTitle || (listTitle = _this.valueOf());
    var list = _.find(window.OTHER_LISTS, function (list) {
      return list.title === listTitle || list.handle === listTitle;
    });
    if (list) {
      window.topItem.saveNow().then(function () {
        window.location.assign(list.path);
      }).catch(function () {
        alert('saving failed');
      })
    } else {
      alert('Could not find list titled "' + listTitle + '"');
    }
  };
});
