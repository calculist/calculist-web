import itemsByGuid from './itemsByGuid';

const getItemByGuid = (function (itemsByGuid) {
  return function (guid) {
    return itemsByGuid[guid];
  };
})(itemsByGuid);

export default getItemByGuid;
