calculist.register('userPreferences',['_','Item','parseTextDoc','getNewGuid'], function (_, Item, parseTextDoc, getNewGuid) {
  var addGuid = function (item) {
    item.guid = getNewGuid();
    _.each(item.$items, addGuid);
  };
  if (!window.USER_PREFERENCES) {
    try {
      var os = require('os');
      var fs = require('fs');
      var fileContent;
      try {
        fileContent = fs.readFileSync(os.homedir() + '/.calculist/preferences.txt', {encoding: 'utf8'});
      } catch (e) {
        fileContent = fs.readFileSync(__dirname + '/default_preferences.txt', {encoding: 'utf8'});
      }
      window.USER_PREFERENCES = parseTextDoc(fileContent)[0];
      addGuid(window.USER_PREFERENCES);
    } catch (e) {
      return new Item({
        guid: 'not a real item',
        $items: [],
        invisible: true
      });
    }
  }

  window.USER_PREFERENCES.invisible = true;
  if (!window.USER_PREFERENCES.guid) addGuid(window.USER_PREFERENCES);

  var userPreferences = new Item(window.USER_PREFERENCES);

  var evaluate = function (item) {
    item.valueOf();
    _.each(item.$items, evaluate);
  };

  // FIXME Should not have to do this
  window.requestAnimationFrame(function () {
    evaluate(userPreferences);
  });

  return userPreferences;

});
