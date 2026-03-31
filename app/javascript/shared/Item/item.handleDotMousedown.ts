import itemOfDrag from './itemOfDrag';

const item_handleDotMousedown = (function (itemOfDrag) {
  return function () { itemOfDrag.change(this); };
})(itemOfDrag);

export default item_handleDotMousedown;
