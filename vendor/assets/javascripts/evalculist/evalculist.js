/**
 * @license
 * evalculist 0.2.2
 * Copyright 2017 Dan Allison <dan@calculist.io> and Calculist LLC <http://calculist.io>
 * Released under MIT license
 */
(function (global) {
  'use strict';
  var EXPRESSION_TOKEN = 'x';
  var VAR_TOKEN = 'v';
  var OPEN_PAREN = '(';
  var CLOSE_PAREN = ')';
  var OPEN_SQUARE = '[';
  var CLOSE_SQUARE = ']';
  var DOT = '.';
  var EQUALS_SIGN = '=';
  var SEMICOLON = ';';
  var TOKEN_TYPE_INDEX = 0;
  var TOKEN_STRING_INDEX = 1;
  var PAREN_DEPTH_INDEX = 2;
  var SQUARE_DEPTH_INDEX = 3;
  var VAR_FUNCTION_NAME = 'variable';
  var DOT_ACC_FUNCTION_NAME = 'dotAccessor';
  var SQUARE_ACC_FUNCTION_NAME = 'bracketAccessor';
  var ASSIGN_FUNCTION_NAME = 'assignment';
  var ESCAPED_DOUBLE_QUOTES_PLACEHOLDER = "______adsfasdfrtrssgoivdfoijwpdfoijdfg_______";
  var ESCAPED_DOUBLE_QUOTES_PATTERN = new RegExp(ESCAPED_DOUBLE_QUOTES_PLACEHOLDER, 'g');
  var ESCAPED_SINGLE_QUOTES_PLACEHOLDER = "______oiwjefoijfviojdfhweoiufhoihsdfoi_______";
  var ESCAPED_SINGLE_QUOTES_PATTERN = new RegExp(ESCAPED_SINGLE_QUOTES_PLACEHOLDER, 'g');
  var isDigit = function (s) { return /\d/.test(s); };
  var compile = function (tokens, i) {
    var expressions = [];
    var t = tokens[i];
    if (!t) return '';
    var pd = t[PAREN_DEPTH_INDEX];
    var sqd = t[SQUARE_DEPTH_INDEX];
    while (t && t[PAREN_DEPTH_INDEX] >= pd && t[SQUARE_DEPTH_INDEX] >= sqd) {
      if (t[TOKEN_TYPE_INDEX] === DOT) {
        var nextT = tokens[++i];
        if (nextT[TOKEN_TYPE_INDEX] === VAR_TOKEN) {
          expressions[expressions.length - 1] = DOT_ACC_FUNCTION_NAME +
            '(' + expressions[expressions.length - 1] + ', "' + nextT[TOKEN_STRING_INDEX] + '")';
        } else {
          expressions[expressions.length - 1] += '.' + nextT[TOKEN_STRING_INDEX];
        }
      } else if (t[TOKEN_TYPE_INDEX] === OPEN_SQUARE) {
        var prevT = tokens[i - 1];
        var nextT = tokens[++i];
        var nextExp = '';
        if (nextT && nextT[SQUARE_DEPTH_INDEX] > sqd) {
          nextExp = compile(tokens, i);
          while (nextT && nextT[SQUARE_DEPTH_INDEX] > sqd) nextT = tokens[++i];
        }
        var exp;
        var isAcc = prevT && nextT && (
                      prevT[TOKEN_TYPE_INDEX] === VAR_TOKEN ||
                      prevT[TOKEN_TYPE_INDEX] === CLOSE_PAREN ||
                      prevT[TOKEN_TYPE_INDEX] === CLOSE_SQUARE
                    ) && nextT[TOKEN_TYPE_INDEX] === CLOSE_SQUARE;
        if (isAcc) {
          exp = SQUARE_ACC_FUNCTION_NAME + '(' + expressions[expressions.length - 1] + ', ' + nextExp +  ')'
        } else {
          exp = '[' + nextExp + (nextT ? nextT[TOKEN_STRING_INDEX] : '');
        }
        if (expressions.length) {
          expressions[expressions.length - 1] = exp;
        } else {
          expressions.push(exp);
        }
      } else if (t[TOKEN_TYPE_INDEX] === OPEN_PAREN) {
        var prevT = tokens[i - 1];
        var nextT = tokens[++i];
        var nextExp = '';
        if (nextT && nextT[PAREN_DEPTH_INDEX] > pd) {
          nextExp = compile(tokens, i);
          while (nextT && nextT[PAREN_DEPTH_INDEX] > pd) nextT = tokens[++i];
        }
        var exp = '(' + nextExp + (nextT ? nextT[TOKEN_STRING_INDEX] : '');
        if (expressions.length) {
          expressions[expressions.length - 1] += exp;
        } else {
          expressions.push(exp);
        }
      } else if (t[TOKEN_TYPE_INDEX] === VAR_TOKEN) {
        var varName = t[TOKEN_STRING_INDEX];
        var nextT = tokens[i + 1];
        while (nextT && (/^\s+$/).test(nextT[TOKEN_STRING_INDEX])) nextT = tokens[++i + 1];
        if (nextT && nextT[TOKEN_TYPE_INDEX] === EQUALS_SIGN) {
          nextT = tokens[++i];
          var nextExp = '';
          if (nextT && nextT[PAREN_DEPTH_INDEX] >= pd) {
            nextExp = compile(tokens, ++i);
            while (nextT && nextT[PAREN_DEPTH_INDEX] >= pd) nextT = tokens[++i];
          }
          var exp = ASSIGN_FUNCTION_NAME + '("' + varName + '",' + nextExp + ')';
          if (expressions.length) {
            expressions[expressions.length - 1] += exp;
          } else {
            expressions.push(exp);
          }
        } else {
          expressions.push(VAR_FUNCTION_NAME + '("' + varName + '")');
        }
      } else {
        expressions.push(t[TOKEN_STRING_INDEX]);
      }
      ++i;
      t = tokens[i];
    }
    return expressions.join('');
  };

  function evalculist (code, handlers) {
    var tokens = [];
    var lines = [tokens];
    var parenDepth = 0;
    var sqrBrktDepth = 0;
    code.replace(/\\"/g , ESCAPED_DOUBLE_QUOTES_PLACEHOLDER)
    .replace(/\\'/g , ESCAPED_SINGLE_QUOTES_PLACEHOLDER)
    .split(/(".*?")/g).forEach(function (dqChunk) {
      return dqChunk.split(/('.*?')/g).map(function (sqChunk) {
        var isStr = sqChunk[0]  == '"' || sqChunk[0] == "'" || sqChunk[sqChunk.length - 1]  == '"' || sqChunk[sqChunk.length - 1] == "'";
        if (isStr) {
          if (tokens.length && tokens[tokens.length - 1][TOKEN_TYPE_INDEX] === EXPRESSION_TOKEN){
            tokens[tokens.length - 1][TOKEN_STRING_INDEX] += sqChunk;
          } else {
            tokens.push([EXPRESSION_TOKEN, sqChunk, parenDepth, sqrBrktDepth]);
          }
        } else {
          sqChunk.split(/(\(|\)|\[|\]|\.|\={2,3}|\!\={1,2}|\=\>|\=|\;|(?:[a-zA-Z\d_\$]+))/g).forEach(function (token) {
            if (!token) return;
            if (/[a-zA-Z\d_\$]+/.test(token)) {
              if (isDigit(token[0])) {
                if (tokens.length && tokens[tokens.length - 1][0] === EXPRESSION_TOKEN){
                  tokens[tokens.length - 1][TOKEN_STRING_INDEX] += token;
                } else {
                  tokens.push([EXPRESSION_TOKEN, token, parenDepth, sqrBrktDepth]);
                }
              } else {
                tokens.push([VAR_TOKEN, token, parenDepth, sqrBrktDepth]);
              }
            } else if (token === OPEN_PAREN) {
              tokens.push([OPEN_PAREN, token, parenDepth, sqrBrktDepth]);
              ++parenDepth;
            } else if (token === CLOSE_PAREN) {
              --parenDepth;
              tokens.push([CLOSE_PAREN, token, parenDepth, sqrBrktDepth]);
            } else if (token === OPEN_SQUARE) {
              tokens.push([OPEN_SQUARE, token, parenDepth, sqrBrktDepth]);
              ++sqrBrktDepth;
            } else if (token === CLOSE_SQUARE) {
              --sqrBrktDepth;
              tokens.push([CLOSE_SQUARE, token, parenDepth, sqrBrktDepth]);
            } else if (token === DOT) {
              tokens.push([DOT, token, parenDepth, sqrBrktDepth]);
            } else if (token === EQUALS_SIGN) {
              tokens.push([EQUALS_SIGN, token, parenDepth, sqrBrktDepth]);
            } else if (token === SEMICOLON && parenDepth === 0 && sqrBrktDepth === 0) {
              tokens = [];
              lines.push(tokens);
            } else {
              if (tokens.length && tokens[tokens.length - 1][0] === EXPRESSION_TOKEN){
                tokens[tokens.length - 1][TOKEN_STRING_INDEX] += token;
              } else {
                tokens.push([EXPRESSION_TOKEN, token, parenDepth, sqrBrktDepth]);
              }
            }
          });
        }
      });
    });
    lines = lines.reduce(function (lines, tokens) {
      if (tokens.length) {
        lines.push(
          compile(tokens, 0)
            .replace(ESCAPED_DOUBLE_QUOTES_PATTERN, '\\"')
            .replace(ESCAPED_SINGLE_QUOTES_PATTERN, "\\'")
        );
      }
      return lines;
    }, []);
    if (handlers === true) return lines.join(SEMICOLON);
    lines[lines.length - 1] = 'return ' + lines[lines.length - 1];
    var fn = new Function(
      VAR_FUNCTION_NAME,
      SQUARE_ACC_FUNCTION_NAME,
      DOT_ACC_FUNCTION_NAME,
      ASSIGN_FUNCTION_NAME,
      "'use strict';" + lines.join(SEMICOLON)
    );
    if (!handlers) return function (handlers) {
      var variable = handlers.variable;
      var bracketAccessor =  handlers.bracketAccessor || handlers.accessor;
      var dotAccessor =  handlers.dotAccessor || handlers.accessor;
      var assignment =  handlers.assignment;
      return fn(variable, bracketAccessor, dotAccessor, assignment);
    };
    var variable = handlers.variable;
    var bracketAccessor =  handlers.bracketAccessor || handlers.accessor;
    var dotAccessor =  handlers.dotAccessor || handlers.accessor;
    var assignment =  handlers.assignment;
    return fn(variable, bracketAccessor, dotAccessor, assignment);
  };

  evalculist.context = {};
  evalculist.variable = function (name) { return evalculist.context[name]; };
  evalculist.accessor = function (object, key) { return object[key]; };
  evalculist.assignment = function (name, val) { return evalculist.context[name] = val; };

  evalculist.new = function (handlers) {
    return function (code) { return evalculist(code, handlers); };
  };

  evalculist.newFromContext = function (context) {
    var handlers = {
      variable: function (name) { return context[name]; },
      accessor: function (object, key) { return object[key]; },
      assignment: function (name, val) { return context[name] = val; }
    };
    return function (code) { return evalculist(code, handlers); };
  };

  try {
    module.exports = evalculist;
  } catch (e) {
    global.evalculist = evalculist;
  }
})(this);
