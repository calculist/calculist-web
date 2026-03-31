import Item from './Item';
import _ from 'lodash';

(function (Item, _) {

  Item.prototype.sortItemsBy = function(sorter) {
    if (_.isString(sorter)) {
      var key = sorter;
      sorter = function(item) {
        return item.$item(key);
      };
    }
    return _.sortBy(this.items, sorter);
  };

})(Item, _);
