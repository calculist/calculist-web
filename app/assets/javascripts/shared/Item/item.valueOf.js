calculist.require(['Item','_','parseItemText','computeItemValue','somethingHasChanged','syncAnimationFrame','eventHub','computationIsPaused'], function (Item, _, parseItemText, computeItemValue, somethingHasChanged, syncAnimationFrame, eventHub, computationIsPaused) {

  'use strict';

  Item.prototype.toString = function () {
    return '' + this._valueOf;
  };

  Item.prototype.valueOf = function () {
    if (computationIsPaused()) return this._valueOf;
    var parsedText = this.parsedText || {};
    if (parsedText.text !== this.text || (this.hasVariableReference && this.lastAnimationFrame !== syncAnimationFrame() && somethingHasChanged())) {
      this.lastAnimationFrame = syncAnimationFrame();
      if (parsedText.text !== this.text) {
        this.evalFn = null;
        parsedText = (this.parsedText = parseItemText(this.text));
      }

      this.valIsComputed = false;
      this.hasVariableReference = false;
      this.key = parsedText.key;
      if (parsedText.separator) {
        switch (parsedText.separator) {
          case ('\\='):
            this.hasVal = true;
            this.valIsComputed = true;
            this.val = computeItemValue(parsedText.val, this);
            if (this.val === this) throw new Error('item cannot be its own value');
            this._valueOf = this.val;
            break;
          // DEPRECATED
          case ('[=]'):
            this.hasVal = true;
            this.valIsComputed = true;
            this.val = computeItemValue(parsedText.val, this);
            if (this.val === this) throw new Error('item cannot be its own value');
            this._valueOf = this.val;
            break;
          case ('\\('):
            this.hasVal = true;
            this.valIsComputed = true;
            var _this = this;
            // TODO abstract this logic into a service
            this.val = function () {
              var pieces = parsedText.val.split(/^(\s*[a-zA-Z_][a-zA-Z_0-9,\s]*)\)\s*=/),
                  argObject = {};
              if (pieces.length > 1) {
                var argNames = pieces[1].split(','),
                    args = arguments;
                _.each(argNames, function (name, i) {
                  argObject[_.trim(name)] = args[i];
                });
                pieces = pieces.slice(2);
              }
              var val = computeItemValue(pieces.join(')='), _this, argObject);
              _this.hasVariableReference = false;
              return val;
            };
            this.val.toString = _.constant('(' + parsedText.val);
            var pieces = parsedText.val.split(/^(\s*[a-zA-Z_][a-zA-Z_0-9,\s]*)(\)\s*=)/);
            this.val.toHTML = _.constant(
              '<span class="separator">(</span>' +
                _.escape(pieces[1]).split(",").join('<span class="separator">,</span>') +
              '<span class="separator">' + _.escape(pieces[2]) + '</span>' +
              _.escape(pieces[3])
            );
            this.val.toStringWithInput = function (input) {
              return _this.key + '(' + input + ')';
            };
            this._valueOf = this.val;
            break;
          case ('\\:'):
            this.hasVal = true;
            this.val = _.trim(parsedText.val);
            if (this.val !== '' && !_.isNaN(+this.val)) this.val = +this.val;
            this._valueOf = this.val;
            break;
          // DEPRECATED
          case ('[=>]'):
            this.hasVal = true;
            this.valIsComputed = true;
            var _this = this;
            // TODO abstract this logic into a service
            this.val = function () {
              var pieces = parsedText.val.split('|'),
                  argObject = {};
              if (pieces.length > 1) {
                var argNames = pieces.shift().split(','),
                    args = arguments;
                _.each(argNames, function (name, i) {
                  argObject[_.trim(name)] = args[i];
                });
              }
              var val = computeItemValue(pieces.join('|'), _this, argObject);
              _this.hasVariableReference = false;
              return val;
            };
            this.val.toString = _.constant(parsedText.val);
            this.val.toStringWithInput = function (input) {
              return _this.key + '(' + input + ')';
            };
            this._valueOf = this.val;
            break;
          case ('\\:'):
            this.hasVal = true;
            this.val = _.trim(parsedText.val);
            if (this.val !== '' && !_.isNaN(+this.val)) this.val = +this.val;
            this._valueOf = this.val;
            break;
          // DEPRECATED
          case ('[:]'):
            this.hasVal = true;
            this.val = _.trim(parsedText.val);
            if (this.val !== '' && !_.isNaN(+this.val)) this.val = +this.val;
            this._valueOf = this.val;
            break;
          // DEPRECATED
          case ('[=#]'):
            this.hasVal = false;
            this.valIsComputed = true;
            this.val = null;
            this._valueOf = this.parsedText.key;
            computeItemValue(parsedText.val, this);
            break;
          default:
            throw new Error('Unexpected separator ' + parsedText.separator);
        }
      } else {
        this.key = this.text;
        this.hasVal = false;
        this.val = null;
        this._valueOf = this.text;
      }
    }

    return this._valueOf;

  };

});
