calculist.register('parseItemText', ['_', 'parseUntilBalanced'], function (_, parseUntilBalanced) {

  'use strict';

  var TEMPORARY_PLACEHOLDER = 'DSFGSpRGBoSAERSFDGSDrFGDFGSDFwGWESRTBGFzAE';

  var separators = [
    '\\(','\\=','\\:',
    // DEPRECATED: These separators will be removed in future versions.
    '[=>]','[=]','[:]',
  ];
  var splitters = {
    '\\(': /(\\\()/,
    '\\=': /(\\\=)/,
    '\\:': /(\\\:)/,
    // DEPRECATED
    '[:]': /(\[:\])/,
    '[=]': /(\[=\])/,
    '[=>]': /(\[=\>\])/,
  };

  var parseEmbed = function (text) {
    var chunks = text.split("\\\^=[");
    if (chunks.length < 2) return;
    // hello \^=[1 + 1] hello \^=[2 + 2]
    // ["hello ", "1 + 1] hello ", "2 + 2]"]
    var pieces = chunks.reduce(function (pieces, chunk, i) {
      if (i === 0) return [chunk]; // First element must be string.
      var computedChunk = parseUntilBalanced('[' + chunk);
      var stringChunk = chunk.slice(computedChunk.length - 1);
      return pieces.concat([
        computedChunk.slice(1, computedChunk.length - 1),
        stringChunk
      ]);
    }, []);
    if (pieces.length < 2) return;
    if (pieces.length % 2 === 0) pieces.push("");
    var strs = pieces.map(function (piece, i) {
      if (i % 2 === 0) return JSON.stringify(piece);
      return piece;
    });
    return {
      text: text,
      key: "",
      val: '__embedString(' +  strs.join (',') + ')',
      separator: '\\='
    }
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
    return object || parseEmbed(text) || {
      text: text,
      key: text,
      val: null,
      separator: null
    };
  };

});
