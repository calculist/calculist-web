import _ from 'lodash';
import $ from 'jquery';
import Clipboard from 'clipboard';
import eventHub from './eventHub';

const copyToClipboard = (function (_, $, Promise, Clipboard, eventHub) {
  return function (text) {
    var trigger = $('<input type="button" value="click to copy">')[0];
    var params: any = {};
    if (_.isElement(text)) {
      params.target = _.constant(text);
    } else {
      params.text = _.constant(text);
    }
    var cb = new Clipboard(trigger, params);
    _.defer(function () { trigger.click(); });
    return new Promise<void>(function (resolve, reject) {
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
})(_, $, Promise, Clipboard, eventHub);

export default copyToClipboard;
