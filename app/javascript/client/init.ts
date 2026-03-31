/**
 * Application bootstrap — creates the top-level Item, sets up save/sync,
 * and wires up event handlers.
 *
 * Converted from calculist.init() call in client/init.js.
 */
import _ from 'lodash';
import $ from 'jquery';
import Backbone from 'backbone';
import Item from '../shared/Item/Item';
import lmDiff from '../shared/utility/lmDiff';
import saveButton from '../client/ui/saveButton';
import getAndApplyChangesFromServer from '../client/services/getAndApplyChangesFromServer';
import jsonToItemTree from '../shared/utility/jsonToItemTree';
import getNewGuid from '../shared/utility/getNewGuid';
import userPreferences from '../client/services/userPreferences';
import calculistFileFormatter from '../shared/utility/calculistFileFormatter';
import faviconHelper from '../client/ui/faviconHelper';

// These are set by inline <script> tags in ERB views
declare global {
  interface Window {
    LIST_DATA: any;
    LIST_ID: any;
    LIST_TITLE: string;
    FILE_PATH: string;
    READ_ONLY: boolean;
    DEV_MODE: any;
    topItem: any;
    id: any;
  }
  var LIST_DATA: any;
  var LIST_ID: any;
  var LIST_TITLE: string;
}

declare var require: any;

// Dynamically resolve executeCommand to avoid circular dependency issues
let _executeCommand: any;
function executeCommand(item: any, text: string) {
  if (!_executeCommand) {
    // Lazy import — commands module may reference Item which references this
    _executeCommand = require('../shared/commands/commands').default?.executeCommand ||
      function() { console.warn('executeCommand not available'); };
  }
  return _executeCommand(item, text);
}

window.DEV_MODE = window.localStorage.DEV_MODE;
if (window.LIST_DATA) {
  $(function() {
    if (!LIST_DATA.guid) {
      LIST_DATA.guid = getNewGuid();
    }
    window.topItem = new (Item as any)(LIST_DATA);
    var protoChangeText = window.topItem.changeText;
    window.topItem.changeText = function (newText: string) {
      faviconHelper.updatePageTitle(newText);
      return protoChangeText.call(this, newText);
    };
    faviconHelper.updatePageTitle(window.topItem.text);
    var saveCount = 0, updateCount = 0;
    var originalFilePath = window.FILE_PATH;
    if (window.FILE_PATH) {
      var openFile = function (filePath: string) {
        console.log(filePath)
        _.defer(function () {
          var fs = require('fs');
          var isCalculistFile = _.endsWith(filePath, '.calculist');
          var file = fs.readFileSync(filePath, 'utf8');
          var markAsCollapsed: any;
          try {
            var fileData = JSON.parse(file);
            window.topItem.initialize(fileData);
            markAsCollapsed = _.noop;
          } catch (e) {
            window.topItem.handlePaste(file, {isCalculistFile: isCalculistFile });
            markAsCollapsed = function (item: any) {
              if (item.items.length) {
                item.collapsed = item.parent && true;
                _.each(item.items, markAsCollapsed);
              }
            };
          }
          markAsCollapsed(window.topItem);
          window.topItem.render();
          window.topItem.focus();
          window.topItem.waitingBeforeSave = false;
          saveButton.changeStatus('saved');
        });
      }
      var electron = require('electron');
      electron.ipcRenderer.on('save', function (event: any, filePath: string) {
        if (!filePath) return;
        window.topItem.saveNow(filePath);
        window.FILE_PATH = filePath;
        window.LIST_TITLE = filePath.split('/').pop()!;
        window.document.title = window.LIST_TITLE;
      });
      electron.ipcRenderer.on('open', function (event: any, filePath: string) {
        openFile(filePath);
      });
      electron.ipcRenderer.on('set-window-id', function (event: any, id: any) {
        window.id = id;
      });
      openFile(window.FILE_PATH)
    }
    var ul = document.getElementById('top-level');
    var previousContent = JSON.stringify(LIST_DATA);
    var previousFlatContent = _.keyBy(window.topItem.flatten_v2(), 'guid');
    window.topItem.refreshDepth();
    window.topItem.collapse = _.noop;
    window.topItem.zoomOut = _.noop;
    window.topItem.saveNow = function(filePath?: string) {
      return new Promise(function (resolve: any, reject: any) {
        ++saveCount;
        if (window.READ_ONLY) return resolve();
        if (filePath) {
          var fs = require('fs');
          var fileContent = _.endsWith(filePath, '.calculist') ? calculistFileFormatter.toCalculistFile(window.topItem) : window.topItem.toText(0, {computed: false});
          fs.writeFileSync(filePath, fileContent, 'utf8');
          saveButton.changeStatus('saved');
          return window.topItem.waitingBeforeSave = false;
        }
        if (!window.LIST_ID) return resolve();
        window.topItem.ensureGuidsAreUnique();
        window.topItem.refreshDepth();
        var newContent = JSON.stringify(window.topItem);
        var newFlatContent = _.keyBy(window.topItem.flatten_v2(), 'guid');
        window.topItem.waitingBeforeSave = false;
        if (newContent === previousContent) {
          saveButton.changeStatus('saved');
          resolve();
        } else {
          var changes = lmDiff.flatItemsByGuidDiff(previousFlatContent, newFlatContent);
          var list = new (Backbone as any).Model({
            title: window.topItem.key,
            changes: changes,
            id: LIST_ID
          });
          list.url = '/lists/' + LIST_ID;
          saveButton.changeStatus('saving');
          getAndApplyChangesFromServer(window.topItem.last_save).then(function (response: any) {
            var pendingPreviousContent = JSON.stringify(window.topItem);
            var pendingPreviousFlatContent = _.keyBy(window.topItem.flatten_v2(), 'guid');
            list.save(null, {
              success: function(m: any, response: any) {
                saveButton.changeStatus('saved');
                previousContent = pendingPreviousContent;
                previousFlatContent = pendingPreviousFlatContent;
                window.topItem.last_save = response.last_save;
                window.topItem.waitingBeforeSave = false;
                resolve();
              },
              error: function() {
                saveButton.changeStatus('saving failed');
                reject();
              }
            });
          }).catch(function () {
            saveButton.changeStatus('saving failed');
          });
        }
      }).catch(function () {
        saveButton.changeStatus('saving failed');
      });
    };
    (function() {
      var debouncedSave = _.debounce(window.topItem.saveNow, 2000);
      window.topItem.save = function() {
        saveButton.changeStatus('save');
        window.topItem.waitingBeforeSave = true;
        if (window.FILE_PATH) {
          require('electron').ipcRenderer.send('documentedited', window.FILE_PATH)
        } else {
          debouncedSave()
        }
      };
    })();
    (function() {
      var focusItem: any, item: any;
      ul!.appendChild(window.topItem.render().el);
      document.title = _.unescape(LIST_TITLE);
      if (sessionStorage.zoomGuid) {
        item = window.topItem.$item(sessionStorage.zoomGuid, 'guid');
        if (!item) sessionStorage.zoomGuid = window.topItem.guid;
        item && item.zoomIn();
      }
      if (sessionStorage.focusGuid) {
        focusItem = window.topItem.$item(sessionStorage.focusGuid, 'guid');
      }
      (focusItem || item || window.topItem).focus();
    })();
    $('#sign-out').on('click', function() {
      var session: any;
      session = new (Backbone as any).Model();
      session.url = '/logout';
      session.isNew = _.constant(false);
      session.destroy({
        success: function() {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }
      });
    });
    saveButton.onClick(function () {
      if (window.FILE_PATH && window.FILE_PATH === originalFilePath) {
        require('electron').ipcRenderer.send('save-attempt', window.id);
      } else {
        window.topItem.saveNow(window.FILE_PATH);
      }
    });
    var refocus = function() {
      _.defer(function() {
        if (!document.hidden) {
          if (sessionStorage.focusGuid) {
            _.defer(function() {
              var item;
              item = window.topItem.$item(sessionStorage.focusGuid, 'guid');
              if (item) {
                item.focus();
              } else if (sessionStorage.zoomGuid) {
                item = window.topItem.$item(sessionStorage.zoomGuid, 'guid');
                if (item) {
                  item.focus();
                } else {
                  sessionStorage.zoomGuid = window.topItem.guid;
                  window.topItem.focus();
                }
              } else {
                window.topItem.focus();
              }
            });
          }
        }
      });
    };
    if (!window.READ_ONLY) {
      var throttledGetChanges = _.throttle(getAndApplyChangesFromServer, 1 * 1000);
      document.addEventListener('visibilitychange', function(e) {
        if (document.hidden) {
          if (window.topItem.waitingBeforeSave) window.topItem.saveNow();
        } else {
          refocus();
          throttledGetChanges(window.topItem.last_save).then(refocus);
        }
      });
      if (window.FILE_PATH) {
        window.addEventListener('blur', function (e) {
          // window.topItem.saveNow();
        });
      } else {
        window.addEventListener('beforeunload', function(e: any) {
          if (window.topItem.waitingBeforeSave) {
            _.delay(_.bind(window.topItem.saveNow, window.topItem), 200);
            e.returnValue = 'Not all changes have saved.';
            return e.returnValue;
          }
        });
      }
    }

    window.requestAnimationFrame(function () {
      window.topItem.softRenderAll();
      _.each([userPreferences, window.topItem], function (topItem: any) {
        var commands = topItem.$item('onpageload');
        if (commands) _.each(commands.items, function (commandItem: any) {
          if (/^[a-zA-Z]/.test(commandItem.text)) executeCommand(window.topItem, commandItem.text);
        });
        if (window.location.pathname === '/welcome') {
          executeCommand(window.topItem, 'celebrate');
        }
      });
      getAndApplyChangesFromServer(window.topItem.last_save).then(function () {
        // TODO Add loading screen
      });
    });
  });
}
