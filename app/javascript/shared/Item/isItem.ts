import Item from './Item';
import type { IItem } from '../types';

function isItem(obj: any): obj is IItem {
  return obj && obj.constructor === Item;
}

export default isItem;
