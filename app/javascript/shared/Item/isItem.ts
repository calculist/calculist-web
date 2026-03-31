import Item from './Item';

const isItem = (function (Item) {
  return function (obj) {
    return obj && obj.constructor === Item;
  };
})(Item);

export default isItem;
