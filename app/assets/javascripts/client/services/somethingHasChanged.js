calculist.register('somethingHasChanged', ['_','eventHub'], function (_, eventHub) {

  var somethingHasChanged = true,
      beforeText;

  eventHub.on('item.changeText:before', function (item) {
    beforeText = item.text;
  });

  eventHub.on('item.changeText', function (item) {
    if (item.text !== beforeText) somethingHasChanged = true;
  });

  eventHub.on('undoableTransaction undo redo', function (delta) {
    somethingHasChanged = true;
    // somethingHasChanged = _.some(delta, function (d) {
    //   return _.some(d, function (v, key) { return key !== 'collapsed'; });
    // });
  });

  eventHub.on('somethingHasChanged', function () {
    somethingHasChanged = true;
  });

  var isAcknowledging = false;
  var acknowledge = function () {
    if (!isAcknowledging) {
      isAcknowledging = true;
      _.delay(function () {
        somethingHasChanged = false;
        isAcknowledging = false;
      }, 3000);
    }
  };

  return function () {
    if (somethingHasChanged) acknowledge();
    return somethingHasChanged;
  };

});
