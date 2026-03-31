import _ from 'lodash';
import emojiHelper from '../services/emojiHelper';

const faviconHelper = (function (_, emojiHelper) {
  // from https://stackoverflow.com/questions/59431371/use-emoji-as-favicon-in-websites
  var setFaviconEmoji = function (emoji) {
    var canvas = document.createElement('canvas');
    canvas.height = 32;
    canvas.width = 32;

    var ctx = canvas.getContext('2d');
    ctx.font = '28px serif';
    ctx.fillText(emoji, 0, 24);

    var favicon = document.querySelector('link[rel=icon]') as HTMLLinkElement;
    if (favicon) { favicon.href = canvas.toDataURL(); }
  }
  return {
    updatePageTitle: _.debounce(function (newText) {
      if (/^\\emoji\[U\+[a-fA-F0-9]+\]/.test(newText)) {
        var codePointString = newText.split(/(?:emoji\[)|\]/g)[1];
        var emoji = emojiHelper.fromCodePointString(codePointString);
        setFaviconEmoji(emoji);
        document.title = newText.split(/(?:emoji\[)|\]/g)[2];
      } else {
        var favicon = document.querySelector('link[rel=icon]') as HTMLLinkElement;
        if (favicon) favicon.href = '/favicon-32x32.png';
        document.title = newText;
      }
    }, 1000)
  };
})(_, emojiHelper);

export default faviconHelper;
