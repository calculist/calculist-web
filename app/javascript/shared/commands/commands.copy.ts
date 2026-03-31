import _ from 'lodash';
import copyToClipboard from '../../client/services/copyToClipboard';
// TODO: resolve import for 'commands.copyItemsToClipboard'
import isItem from '../Item/isItem';
import commands_copy from './commands.copy';

const commands_copy = (function (_, copyToClipboard, copyItemsCommand, isItem) {
  return _.rest(function (_this, thingToCopy, options) {
    if (thingToCopy == null) thingToCopy = _this;
    if (isItem(thingToCopy)) {
      thingToCopy = [thingToCopy];
    }
    if (_.isArray(thingToCopy) && isItem(thingToCopy[0])) {
      copyItemsCommand({ items: thingToCopy, focus: _.noop }, options);
    } else {
      copyToClipboard('' + thingToCopy);
    }
  });
})(_, copyToClipboard, commands_copyItemsToClipboard, isItem);

const commands_copyItems = (function (copyCommand) {
  return function (_this, options) {
    return copyCommand(_this, _this.items, options);
  };
})(commands_copy);

const commands_cut = (function (_, copyCommand, isItem) {
  return function (_this, thingToCut, options) {
    copyCommand.apply(this, arguments);
    if (thingToCut == null || isItem(thingToCut)) return (thingToCut || _this).deleteItem(true);
    if (_.isArray(thingToCut) && isItem(thingToCut[0])) {
      thingToCut.forEach(function (item) { item.deleteItem(true); });
    }
  };
})(_, commands_copy, isItem);

export { commands_copy, commands_copyItems, commands_cut };
