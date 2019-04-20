calculist.register('copyToClipboard', ['_','$','Promise','Clipboard','eventHub'], function (_, $, Promise, Clipboard, eventHub) {
  return function (text) {
    var trigger = $('<input type="button" value="click to copy">')[0];
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
        trigger.remove();
        resolve();
        eventHub.trigger('copyToClipboard');
      });
      cb.on('error', function () {
        eventHub.trigger('needClickToConfirmCopy', trigger);
      });
    });
  };
});
