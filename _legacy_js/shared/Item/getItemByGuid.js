calculist.register('getItemByGuid', ['itemsByGuid'], function (itemsByGuid) {
  return function (guid) {
    return itemsByGuid[guid];
  };
});
