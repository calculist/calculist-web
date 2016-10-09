calculist.register('item.flatten', ['_'], function (_) {

  var flatten = _.method('flatten');

  return function () {
    return _.flatten([this.toFlatJSON()].concat(this.$items.map(flatten)));
  };

});

calculist.register('item.flatten_v2', ['_'], function (_) {

  var flatten_v2 = _.method('flatten_v2');

  return function () {
    return _.flatten([this.toFlatJSON_v2()].concat(this.$items.map(flatten_v2)));
  };

});

// TODO make this the default `flatten` method
calculist.register('item._flatten', ['_'], function (_) {

  var flatten = _.method('_flatten');

  return function () {
    return _.flatten([this].concat(this.$items.map(flatten)));
  };

});
