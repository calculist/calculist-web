import _ from 'lodash';
import eventHub from '../../client/services/eventHub';

const varExists = (function (_, eventHub) {
  var itemCountByKey: Record<string, number> = {};
  eventHub.on('keychange', function (prev: string, nw: string) {
    if (prev) {
      prev = prev.replace(/\s/g, '_');
      itemCountByKey[prev] = itemCountByKey[prev] - 1;
    }
    if (nw) {
      nw = nw.replace(/\s/g, '_');
      itemCountByKey[nw] = (itemCountByKey[nw] || 0) + 1;
    }
  });

  return function (varName: string): number | undefined {
    return itemCountByKey[varName];
  };
})(_, eventHub);

export default varExists;
