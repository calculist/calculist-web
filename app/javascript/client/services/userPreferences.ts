import _ from 'lodash';
import Item from '../../shared/Item/Item';
import parseTextDoc from '../../shared/Item/parseTextDoc';
import getNewGuid from '../../shared/utility/getNewGuid';

declare var require: any;
declare var __dirname: string;

// Lazy initialization — userPreferences creates an Item, which requires
// Item.prototype.initialize to be wired up. In ES modules, import order
// means this module may execute before extendItemPrototype has run.
// We defer the actual Item creation to first access.

let _instance: any = null;

function getUserPreferences() {
  if (_instance) return _instance;

  var addGuid = function (item: any) {
    item.guid = getNewGuid();
    _.each(item.items, addGuid);
  };

  if (!(window as any).USER_PREFERENCES) {
    try {
      var os = require('os');
      var fs = require('fs');
      var fileContent;
      try {
        fileContent = fs.readFileSync(os.homedir() + '/.calculist/preferences.txt', {encoding: 'utf8'});
      } catch (e) {
        fileContent = fs.readFileSync(__dirname + '/default_preferences.txt', {encoding: 'utf8'});
      }
      (window as any).USER_PREFERENCES = parseTextDoc(fileContent)[0];
      addGuid((window as any).USER_PREFERENCES);
    } catch (e) {
      _instance = new (Item as any)({
        guid: 'not a real item',
        items: [],
        invisible: true
      });
      return _instance;
    }
  }

  (window as any).USER_PREFERENCES.invisible = true;
  if (!(window as any).USER_PREFERENCES.guid) addGuid((window as any).USER_PREFERENCES);

  _instance = new (Item as any)((window as any).USER_PREFERENCES);

  var evaluate = function (item: any) {
    item.valueOf();
    _.each(item.items, evaluate);
  };

  window.requestAnimationFrame(function () {
    evaluate(_instance);
  });

  return _instance;
}

// Export a proxy object that delegates to the lazy instance
const userPreferences: any = new Proxy({}, {
  get(_target, prop) {
    const instance = getUserPreferences();
    const val = instance[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export default userPreferences;
