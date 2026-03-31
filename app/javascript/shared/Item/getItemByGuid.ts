import itemsByGuid from './itemsByGuid';
import type { IItem } from '../types';

function getItemByGuid(guid: string): IItem | undefined {
  return itemsByGuid[guid];
}

export default getItemByGuid;
