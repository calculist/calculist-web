calculist.register('commands.goto', ['_','isItem','getItemByGuid','zoomPage','itemTagsHelper'], function (_, isItem, getItemByGuid, zoomPage, itemTagsHelper) {

  return function (_this, item) {
    if (!isItem(item)) item = itemTagsHelper.getItemByIdTag(item) ||getItemByGuid(item) || _this.$item(item) || _this.$$item(item);
    if (!isItem(item)) return;
    var zoomOutUntilInPage = function (resolve, reject) {
      if (zoomPage.isInPage(item)) {
        resolve();
      } else if (zoomPage.getZoomDepth() > 0) {
        zoomPage.getTopItem().zoomOut().then(function () {
          zoomOutUntilInPage(resolve, reject);
        });
      } else {
        reject();
      }
    };
    (new Promise(zoomOutUntilInPage)).then(function () {
      item.parent ? item.parent.expand(true).then(function () {
        item.focus();
      }) : item.focus();
    });
  };

});
