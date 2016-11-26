//= require lodash/lodash
//= require simple_statistics/simple_statistics
//= require evalculist/evalculist
//= require acyclic/acyclic
//= require calculist
//= require ./shared/utility/vendors
//= require ./shared/utility/keyToVarName
//= require ./shared/Item/parseItemText
//= require ./shared/Item/isItem
//= require ./shared/Item/findVar
//= require ./shared/Item/createComputationContextObject
//= require ./shared/Item/computeItemValue
//= require_self

var getDiff = function (a, b, keys) {
  var diff;
  if (a && !b) {
    diff = [a, 0, 0];
  } else if (!a && b) {
    diff = [b];
  } else {
    _.each(keys, function (key) {
      if (a[key] === b[key]) return;
      diff || (diff = {});
      diff[key] = [a[key], b[key]];
    });
  }
  return diff;
};

calculist.register('Item', ['_'], function (_) {
  var prepareItems = function (items, _this) {
    return _.map(_.compact(items), function(item) {
      var newItemOptions = _.isPlainObject(item) ? _.clone(item) : item.toJSON();
      item.$parent = _this;
      return new Item(newItemOptions);
    });
  };

  function Item (data) {
    this.guid = data.guid;
    if (!this.guid) throw new Error('guid required');
    this.text = data.text;
    this.$parent = data.$parent;
    this.sort_order = data.sort_order;
    this.$items = prepareItems(data.$items, this);
  }

  return Item;

});

calculist.require(['_','Item','parseItemText','computeItemValue'], function (_, Item, parseItemText, computeItemValue) {
  Item.prototype.valueOf = function () {
    if (!this.parsedText || this.parsedText.text !== this.text || this.valIsComputed) {
      var parsedText = this.parsedText;
      if (!parsedText || parsedText.text !== this.text) {
        parsedText = (this.parsedText = parseItemText(this.text));
      }

      this.valIsComputed = false;
      this.key = parsedText.key;
      if (parsedText.separator) {
        switch (parsedText.separator) {
          case ('[=]'):
            this.hasVal = true;
            this.valIsComputed = true;
            this.val = computeItemValue(parsedText.val, this);
            this._valueOf = this.val;
            break;
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
              return computeItemValue(pieces.join('|'), _this, argObject);
            };
            this.val.toString = _.constant( parsedText.val);
            this._valueOf = this.val;
            break;
          case ('[:]'):
            this.hasVal = true;
            this.val = _.trim(parsedText.val);
            if (this.val !== '' && !_.isNaN(+this.val)) this.val = +this.val;
            this._valueOf = this.val;
            break;
          case ('[#]'):
            this.hasVal = false;
            this.val = null;
            this._valueOf = this.key;
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

calculist.init(['Item'], function (Item) {
  onmessage = function(e) {
    if (e.data.action === 'compute') {
      var tree = new Item(e.data.tree);
      var valsByGuid = {};
      var computeNext = function (items) {
        _.each(items, function (item) {
          valsByGuid[item.guid] = item.valueOf();
          if (item.$items.length) computeNext(item.$items);
        });
      };
      computeNext([tree]);
      postMessage(valsByGuid);
    } else {
      var keys = _.keys(e.data[0][0]);
      _.pull(keys, 'guid');
      var guids = _.union(_.map(e.data[0], 'guid'), _.map(e.data[1], 'guid'));
      var before = _.keyBy(e.data[0], 'guid');
      var after = _.keyBy(e.data[1], 'guid');
      var changes;
      _.each(guids, function (guid) {
        var diff = getDiff(before[guid], after[guid], keys);
        if (diff) {
          changes || (changes = {});
          changes[guid] = diff;
        }
      });
      postMessage(changes);
    }
  };
});
