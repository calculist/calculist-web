calculist.register('jsonToItemTree', ['_','getNewGuid'], function (_, getNewGuid) {

  var jsonToItemTree = function (json, text) {
    if (!text || _.isNumber(text)) {
      text = '';
    }
    if (!_.isObject(json)) {
      if (text && json != null) text += ' [:] ';
      if (json != null) text += json;
      json = null;
    }
    return {
      text: text || '...',
      items: _.map(json, jsonToItemTree),
      guid: getNewGuid()
    };
  };

  return function (json, text) {
    if (_.isString(json)) json = JSON.parse(json);
    var data = jsonToItemTree(json, text);
    return data;
  };

});
