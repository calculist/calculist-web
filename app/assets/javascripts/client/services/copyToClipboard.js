lm.register('copyToClipboard', ['_','$','Promise','Clipboard'], function (_, $, Promise, Clipboard) {
  return function (text) {
    var trigger = $('<input type="button">')[0];
    var params = {};
    if (_.isElement(text)) {
      params.target = _.constant(text);
    } else {
      params.text = _.constant(text);
    }
    var cb = new Clipboard(trigger, params);
    _.defer(function () { trigger.click(); });
    return new Promise(function (resolve, reject) {
      cb.on('success', function () {
        cb.destroy();
        resolve();
      });
      cb.on('error', function () {
        cb.destroy();
        reject();
      });
    });
  };
});
