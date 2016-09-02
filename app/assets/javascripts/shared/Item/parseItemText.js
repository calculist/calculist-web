lm.register('parseItemText', ['_'], function (_) {

  'use strict';

  var TEMPORARY_PLACEHOLDER = 'DSFGSpRGBoSAERSFDGSDrFGDFGSDFwGWESRTBGFzAE';

  var separators = ['[=]','[=>]','[:]','[#]'],
      splitters = {
        '[=]': /(\[=\])/,
        '[=>]': /(\[=\>\])/,
        '[:]': /(\[:\])/,
        '[#]': /(\[#\])/,
      };

  var parseWithSeparator = function (text, separator) {
    var pieces = text.replace('\\' + separator, TEMPORARY_PLACEHOLDER).split(splitters[separator]);
    if (_.isString(pieces[2])) {
      return {
        text: text,
        key: _.trim(pieces[0]).replace(TEMPORARY_PLACEHOLDER, pieces[1]),
        val: pieces.slice(2).join('').replace(TEMPORARY_PLACEHOLDER, pieces[1]),
        separator: pieces[1]
      };
    }
  };

  return function (text) {
    var object = null,
        i = -1;

    while (++i < separators.length && !object) {
      object = parseWithSeparator(text, separators[i]);
    }

    return object || {
      text: text,
      key: text,
      val: null,
      separator: null
    };
  };

});
