import _ from 'lodash';
import isItem from './isItem';
import keyToVarName from '../utility/keyToVarName';
import type { IItem } from '../types';

function varVal(item: IItem): any {
  var val: any;
  if (item.hasVal) {
    val = item.valueOf();
    var loops = 0;
    while (val && isItem(val) && val.hasVal && ++loops < 100) {
      val = val.valueOf();
    }
  } else {
    val = item;
  }
  return val;
}

function findVar(item: IItem, varName: string): any {
  if (!item.parent) return;
  var items = item.parent.items;
  var i = items.indexOf(item);
  while (--i >= 0) {
    if (keyToVarName(items[i].key) === varName) return varVal(items[i]);
    if (items[i].key === 'variables') {
      var j = items[i].items.length;
      while (--j >= 0) {
        if (keyToVarName(items[i].items[j].key) === varName) return varVal(items[i].items[j]);
      }
    }
  }
  if (keyToVarName(item.parent.key) === varName) return varVal(item.parent);
  return findVar(item.parent, varName);
}

export default findVar;
