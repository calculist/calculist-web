import _ from 'lodash';
import parseUntilBalanced from '../utility/parseUntilBalanced';
import type { ParsedItemText } from '../types';

const parseItemText = (function (_, parseUntilBalanced) {

  'use strict';

  var TEMPORARY_PLACEHOLDER = 'DSFGSpRGBoSAERSFDGSDrFGDFGSDFwGWESRTBGFzAE';

  var separators: string[] = [
    '\\(','\\=','\\:',
    // DEPRECATED: These separators will be removed in future versions.
    '[=>]','[=]','[:]',
  ];
  var splitters: Record<string, RegExp> = {
    '\\(': /(\\\()/,
    '\\=': /(\\\=)/,
    '\\:': /(\\\:)/,
    // DEPRECATED
    '[:]': /(\[:\])/,
    '[=]': /(\[=\])/,
    '[=>]': /(\[=\>\])/,
  };

  var parseEmbed = function (text: string): ParsedItemText | undefined {
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

  var parseWithSeparator = function (text: string, separator: string): ParsedItemText | undefined {
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

  return function (text: string): ParsedItemText {
    var object: ParsedItemText | undefined = undefined,
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

})(_, parseUntilBalanced);

export default parseItemText;
