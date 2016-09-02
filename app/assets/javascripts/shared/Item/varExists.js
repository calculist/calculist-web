lm.register('varExists',['_','eventHub'], function (_, eventHub) {
  var itemCountByKey = {};
  eventHub.on('keychange', function (prev, nw) {
    if (prev) {
      prev = prev.replace(/\s/g, '_');
      itemCountByKey[prev] = itemCountByKey[prev] - 1;
    }
    if (nw) {
      nw = nw.replace(/\s/g, '_');
      itemCountByKey[nw] = (itemCountByKey[nw] || 0) + 1;
    }
  });

  return function (varName) {
    return itemCountByKey[varName];
  };
});
