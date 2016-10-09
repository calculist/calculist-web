calculist.register('lmDiff', ['_','Promise','Worker','jsondiffpatch','getItemByGuid'], function (_, Promise, Worker, jsondiffpatch, getItemByGuid) {

  var worker = new Worker(window.location.protocol + '//' + window.location.host + WORKER_FILE_PATH);

  return {
    plainDiff: function (a, b) {
      return new Promise(function (resolve, reject) {
        worker.onmessage = function (e) {
          resolve(e.data);
        };
        worker.postMessage([a, b]);
      });
    },
    flatItemsByGuidDiff: function (flatItemsByGuid_Before, flatItemsByGuid_After) {
      var diff = jsondiffpatch.diff(flatItemsByGuid_Before, flatItemsByGuid_After);
      return _.map(diff, function (changedAttrs, guid) {
        // TODO fix the bug where item can sometimes be undefined
        var item = getItemByGuid(guid);
        var json = item.toFlatJSON_v2();
        if (_.isArray(changedAttrs)) {
          if (changedAttrs.length === 3) {
            json.is_deleted = true;
          } else {
            json.is_deleted = false;
          }
        } else if (item.onServer) {
          var attrs = json;
          json = _.reduce(changedAttrs, function (_json, change, attrName) {
            _json[attrName] = attrs[attrName];
            return _json;
          }, {guid: attrs.guid});
        }
        return json;
      });
    }
  };
});
