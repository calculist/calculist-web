import _ from 'lodash';

const item_flatten = (function (_) {

  var flatten = _.method('flatten');

  return function () {
    return _.flatten([this.toFlatJSON()].concat(this.items.map(flatten)));
  };

})(_);

const item_flatten_v2 = (function (_) {

  var flatten_v2 = _.method('flatten_v2');

  return function () {
    return _.flatten([this.toFlatJSON_v2()].concat(this.items.map(flatten_v2)));
  };

})(_);

// TODO make this the default `flatten` method

const item__flatten = (function (_) {

  var flatten = _.method('_flatten');

  return function () {
    return _.flatten([this].concat(this.items.map(flatten)));
  };

})(_);

export { item_flatten, item_flatten_v2, item__flatten };
