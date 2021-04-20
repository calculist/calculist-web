calculist.register('calculistVersion', [], function () {
  return {
    get: function () {
      // TODO Make this more general.
      var firstItem = window.topItem.items[0];
      var val = firstItem && firstItem.valueOf();
      var isV1 = val === 1 && firstItem.key === 'Calculist version';
      return isV1 ? 'v1' : 'default';
    }
  }
});
