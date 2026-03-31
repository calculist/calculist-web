import _ from 'lodash';
import * as jsondiffpatch from 'jsondiffpatch';
import getItemByGuid from '../Item/getItemByGuid';

const lmDiff = (function (_, Promise, Worker, jsondiffpatch, getItemByGuid) {

  // Lazy worker — WORKER_FILE_PATH is set by inline script in ERB view
  // and may not be available at module import time
  var worker: any;
  var getWorker = function() {
    if (!worker) worker = new Worker((window as any).WORKER_FILE_PATH);
    return worker;
  };

  return {
    plainDiff: function (a: any, b: any) {
      return new Promise(function (resolve: any, reject: any) {
        var w = getWorker();
        w.onmessage = function (e: any) {
          resolve(e.data);
        };
        w.postMessage([a, b]);
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
})(_, Promise, Worker, jsondiffpatch, getItemByGuid);

export default lmDiff;
