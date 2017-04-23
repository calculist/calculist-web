//= require lodash/lodash
//= require_self

var getDiff = function (a, b, keys) {
  var diff;
  if (a && !b) {
    diff = [a, 0, 0];
  } else if (!a && b) {
    diff = [b];
  } else {
    _.each(keys, function (key) {
      if (a[key] === b[key]) return;
      diff || (diff = {});
      diff[key] = [a[key], b[key]];
    });
  }
  return diff;
};

onmessage = function(e) {
  var keys = _.keys(e.data[0][0]);
  _.pull(keys, 'guid');
  var guids = _.union(_.map(e.data[0], 'guid'), _.map(e.data[1], 'guid'));
  var before = _.keyBy(e.data[0], 'guid');
  var after = _.keyBy(e.data[1], 'guid');
  var changes;
  _.each(guids, function (guid) {
    var diff = getDiff(before[guid], after[guid], keys);
    if (diff) {
      changes || (changes = {});
      changes[guid] = diff;
    }
  });
  postMessage(changes);
};
