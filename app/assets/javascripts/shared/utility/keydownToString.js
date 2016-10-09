calculist.register('keydownToString', ['_'], function (_) {

  var specialKeys = ['ctrl','alt','shift'];

  var otherKeys = {
    8: 'delete',
    9: 'tab',
    13: 'enter',
    16: false, // shift
    17: false, // ctrl
    18: false, // alt
    32: 'spacebar',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    91: false, // cmd
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '?',
    192: '~',
    219: '[',
    220: '|',
    221: ']',
  };

  return function (e) {
    var keyNames = [];
    if (e.metaKey) {
      keyNames.push('cmd');
    }
    _.each(specialKeys, function (key) {
      if (e[key + 'Key']) keyNames.push(key);
    });
    var char = otherKeys[e.which];
    if (char === (void 0)) char = String.fromCharCode(e.which).toLowerCase();
    if (char) keyNames.push(char);
    return keyNames.join(' + ');
  };

});
