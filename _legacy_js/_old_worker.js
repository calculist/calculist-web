//= require_self

var getDiff = function (a, b, keys) {
  var diff;
  if (a && !b) {
    diff = [a, 0, 0];
  } else if (!a && b) {
    diff = [b];
  } else {
    keys.forEach(function (key) {
      if (a[key] === b[key]) return;
      diff || (diff = {});
      diff[key] = [a[key], b[key]];
    });
  }
  return diff;
};

onmessage = function(e) {
  var guids = {};
  var before = {};
  var after = {};
  var maxLen = Math.max(e.data[0].length, e.data[1].length);
  var i = -1;
  while (++i < maxLen) {
    var bf = e.data[0][i];
    var af = e.data[1][i];
    if (bf) {
      guids[bf.guid] = null;
      before[bf.guid] = bf;
    }
    if (af) {
      guids[af.guid] = null;
      after[af.guid] = af;
    }
  }
  var keys = Object.keys(e.data[0][0]).reduce(function (keys, key) {
    if (key !== 'guid') keys.push(key);
    return keys;
  }, []);
  var changes;
  Object.keys(guids).forEach(function (guid) {
    var diff = getDiff(before[guid], after[guid], keys);
    if (diff) {
      changes || (changes = {});
      changes[guid] = diff;
    }
  });
  postMessage(changes);
};
