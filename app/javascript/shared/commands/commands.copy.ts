import _ from 'lodash';
import copyToClipboard from '../../client/services/copyToClipboard';
import commands from './commands';
import isItem from '../Item/isItem';

const commands_copy = (function (_: any, copyToClipboard: any, commands: any, isItem: any) {
  return _.rest(function (_this: any, thingToCopy: any, options: any) {
    if (thingToCopy == null) thingToCopy = _this;
    if (isItem(thingToCopy)) {
      thingToCopy = [thingToCopy];
    }
    if (_.isArray(thingToCopy) && isItem(thingToCopy[0])) {
      commands.copyItemsToClipboard({ items: thingToCopy, focus: _.noop }, options);
    } else {
      copyToClipboard('' + thingToCopy);
    }
  });
})(_, copyToClipboard, commands, isItem);

const commands_copyItems = (function (copyCommand: any) {
  return function (_this: any, options: any) {
    return copyCommand(_this, _this.items, options);
  };
})(commands_copy);

const commands_cut = (function (_: any, copyCommand: any, isItem: any) {
  return function (_this: any, thingToCut: any, options: any) {
    copyCommand.apply(this, arguments);
    if (thingToCut == null || isItem(thingToCut)) return (thingToCut || _this).deleteItem(true);
    if (_.isArray(thingToCut) && isItem(thingToCut[0])) {
      thingToCut.forEach(function (item: any) { item.deleteItem(true); });
    }
  };
})(_, commands_copy, isItem);

export { commands_copy, commands_copyItems, commands_cut };
