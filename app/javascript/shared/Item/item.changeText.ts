import _ from 'lodash';
import transaction from '../../client/services/transaction';
import eventHub from '../../client/services/eventHub';
import parseItemText from './parseItemText';

const item_changeText = (function (_, transaction, eventHub, parseItemText) {

  return function(newText) {
    if (this.text === newText) return;
    eventHub.trigger('item.changeText:before', this);
    transaction.debounced(_.noop);
    this.text = newText;
    var prevKey = this.key;
    this.evalFn = null;
    this.parseItemText = parseItemText(this.text);
    this.inputLines = null;
    this.key = this.parseItemText.key;
    if (this.key !== prevKey) eventHub.trigger('keychange', prevKey, this.key);
    this.save();
    eventHub.trigger('item.changeText', this);
  };

})(_, transaction, eventHub, parseItemText);

const item_addText = (function () {

  return function(newText) {
    return this.changeText(this.text + newText);
  };

})();

export { item_changeText, item_addText };
