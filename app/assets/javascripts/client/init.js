// TODO refactor
calculist.init(['LIST_DATA','Item','_','$','Backbone','lmDiff','saveButton','getAndApplyChangesFromServer','jsonToItemTree','getNewGuid','userPreferences','executeCommand','calculistFileFormatter','faviconHelper'], function (foo, Item, _, $, Backbone, lmDiff, saveButton, getAndApplyChangesFromServer, jsonToItemTree, getNewGuid, userPreferences, executeCommand, calculistFileFormatter, faviconHelper) {
  window.DEV_MODE = window.localStorage.DEV_MODE;
  if (!window.LIST_DATA) return;
  $(function() {
    if (!LIST_DATA.guid) {
      LIST_DATA.guid = getNewGuid();
    }
    window.topItem = new Item(LIST_DATA);
    var protoChangeText = window.topItem.changeText;
    window.topItem.changeText = function (newText) {
      faviconHelper.updatePageTitle(newText);
      return protoChangeText.call(this, newText);
    };
    faviconHelper.updatePageTitle(window.topItem.text);
    var saveCount = 0, updateCount = 0;
    var originalFilePath = window.FILE_PATH;
    if (window.FILE_PATH) {
      var openFile = function (filePath) {
        console.log(filePath)
        _.defer(function () {
          var fs = require('fs');
          var isCalculistFile = _.endsWith(filePath, '.calculist');
          var file = fs.readFileSync(filePath, 'utf8');
          var markAsCollapsed;
          try {
            var fileData = JSON.parse(file);
            window.topItem.initialize(fileData);
            markAsCollapsed = _.noop;
          } catch (e) {
            // NOTE If JSON.parse fails, we assume the deprecated format.
            // This will be removed in future versions.
            window.topItem.handlePaste(file, {isCalculistFile: isCalculistFile });
            markAsCollapsed = function (item) {
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
          // fs.watchFile(window.FILE_PATH, { persistent: true, interval: 1007 }, function (a, b) {
          //   if (a.mtime != b.mtime) {
          //     console.log(saveCount, updateCount);
          //     if (++updateCount > saveCount) {
          //       if (window.confirm('This file has changed on disk. Reload?')) {
          //         window.topItem.waitingBeforeSave = false;
          //         window.topItem.saveNow = _.noop;
          //         window.location.reload();
          //       } else {
          //         --updateCount;
          //       }
          //     }
          //   }
          // });
        });
      }
      var electron = require('electron');
      electron.ipcRenderer.on('save', function (event, filePath) {
        if (!filePath) return;
        window.topItem.saveNow(filePath);
        window.FILE_PATH = filePath;
        window.LIST_TITLE = filePath.split('/').pop();
        window.document.title = window.LIST_TITLE;
      });
      electron.ipcRenderer.on('open', function (event, filePath) {
        openFile(filePath);
      });
      electron.ipcRenderer.on('set-window-id', function (event, id) {
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
    window.topItem.saveNow = function(filePath) {
      return new Promise(function (resolve, reject) {
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
          // console.log(changes);
          var list = new Backbone.Model({
            title: window.topItem.key,
            // content: newContent,
            changes: changes,
            id: LIST_ID
          });
          list.url = '/lists/' + LIST_ID;
          saveButton.changeStatus('saving');
          // localStorage.tabsOpen = '';
          // localStorage.items = newContent;
          // localStorage.tabsOpen = +(localStorage.tabsOpen || '0') + 1;
          getAndApplyChangesFromServer(window.topItem.last_save).then(function (response) {
            // TODO Need to get previous content before getting changes from server, then
            // somehow excluding those changes from the next diff.
            // As it stands now, this can result in bad data.
            var pendingPreviousContent = JSON.stringify(window.topItem);
            var pendingPreviousFlatContent = _.keyBy(window.topItem.flatten_v2(), 'guid');
            list.save(null, {
              success: function(m, response) {
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
          });;
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
      var focusItem, item;
      ul.appendChild(window.topItem.render().el);
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
      var session;
      session = new Backbone.Model();
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
        // TODO add a warning for desktop also
        window.addEventListener('beforeunload', function(e) {
          if (window.topItem.waitingBeforeSave) {
            _.delay(_.bind(window.topItem.saveNow, window.topItem), 200);
            e.returnValue = 'Not all changes have saved.';
            return e.returnValue;
          }
        });

      }
    }

    window.requestAnimationFrame(function () {
      // This fixes a bug where computed values
      // are not always correct on initial pageload.
      window.topItem.softRenderAll();
      _.each([userPreferences, window.topItem], function (topItem) {
        var commands = topItem.$item('onpageload');
        if (commands) _.each(commands.items, function (commandItem) {
          if (/^[a-zA-Z]/.test(commandItem.text)) executeCommand(window.topItem, commandItem.text);
        });
      });
      getAndApplyChangesFromServer(window.topItem.last_save).then(function () {
        // TODO Add loading screen
      });
    });
  });
});
