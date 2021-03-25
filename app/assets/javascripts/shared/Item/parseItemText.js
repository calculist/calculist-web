calculist.register('parseItemText', ['_'], function (_) {

  'use strict';

  var TEMPORARY_PLACEHOLDER = 'DSFGSpRGBoSAERSFDGSDrFGDFGSDFwGWESRTBGFzAE';

  var separators = ['[:]','[=]','[=>]','[=#]'],
      splitters = {
        '[:]': /(\[:\])/,
        '[=]': /(\[=\])/,
        '[=>]': /(\[=\>\])/,
        '[=#]': /(\[=\#\])/,
      };

  var parseEmbed = function (text) {
    var pieces = [];
    var i = 0;
    var sqrDepth = 0;
    var mode = 'txt';
    var currentString = '';
    var prevPrevChar, prevChar, char;
    while (i < text.length) {
      prevPrevChar = prevChar;
      prevChar = char;
      char = text[i];
      i += 1;
      if (mode === 'txt') {
        if (char === '^') {
          continue;
        } else if (prevChar === '^' && char ==='[') {
          if (prevPrevChar === '\\') {
            currentString += prevChar + char;
            prevChar = '';
          }
          continue;
        } else if (prevPrevChar === '^' && prevChar === '[' && char === '=') {
          pieces.push(currentString);
          currentString = '';
          mode = 'exp';
          sqrDepth += 1;
          continue;
        } else if (prevPrevChar === '^' && prevChar === '[' && char !== '=') {
          currentString += '^[' + char;
          continue;
        } else if (prevChar === '^') {
          currentString += '^' + char;
          continue;
        } else {
          currentString += char;
          continue;
        }
      } else if (mode === 'exp') {
        if (char === '[') {
          sqrDepth += 1;
          currentString += char;
        } else if (char === ']') {
          sqrDepth -= 1;
          if (sqrDepth === 0) {
            pieces.push(currentString);
            currentString = '';
            mode = 'txt';
          } else {
            currentString += char;
          }
        } else {
          currentString += char;
        }
      } else if (mode === 'str') {
        // TODO
        // if (char === '"')
      }
    }
    pieces.push(currentString);
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
      separator: '[=]'
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
