lm.register('item.executeCommand', ['_','$','transaction','computeItemValue','cursorPosition','commandTypeahead','getNewGuid','copyToClipboard','downloadFile','isItem','userPreferences'], function (_, $, transaction, computeItemValue, cursorPosition, commandTypeahead, getNewGuid, copyToClipboard, downloadFile, isItem, userPreferences) {

  return function(commandString) {
    var _this = this,
        Item = this.constructor;

    var cli = {
      openFile: function () {

      },
      newList: function (title, handle) {
        if (!title) return alert('New lists need titles.');
        handle || (handle = _.lowerCase(title).replace(/\s/g,''));
        window.topItem.saveNow().then(function () {
          window.location.assign('/list/new?title=' + encodeURIComponent(title) + '&handle=' + handle);
        }).catch(function () {
          alert('saving failed');
        })
      },
      goto: function (item) {
        if (!isItem(item)) item = _this.$item(item) || _this.$$item(item);
        item.$parent ? item.$parent.expand(true).then(function () {
          item.focus();
        }) : item.focus();
      },
      changeTheme: function (theme) {
        $('#main-container').removeClass().addClass('theme-' + theme);
      },
      enterCommandMode: function () {
        if (_this.mode !== 'command') {
          _this.enterCommandMode();
        }
      },
      exitCommandMode: function () {
        if (_this.mode === 'command') {
          _this.exitCommandMode();
        }
      },
      toggleCommandMode: function () {
        if (_this.mode === 'command') {
          _this.exitCommandMode();
        } else {
          _this.enterCommandMode();
        }
      },
      addText: function (text) {
        if (_this.hasFocus) {
          var cursorIndex = cursorPosition.get(_this.depth);
          if (_this.mode !== 'command' && (cursorIndex >= _this.text.length || !(cursorIndex >= 0))) {
            _this.text += text;
          } else if (_this.mode === 'command') {
            var $input = _this.$('#input' + _this.id);
            var textArray = _.toArray($input.text());
            textArray.splice(cursorIndex, 0, text);
            $input.text(textArray.join(''));
            var range = document.createRange();
            var sel = window.getSelection();
            range.collapse(true);
            range.setStart($input[0].childNodes[0], cursorIndex + text.length);
            range.setEnd($input[0].childNodes[0], cursorIndex + text.length);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            var textArray = _.toArray(_this.text);
            textArray.splice(cursorIndex, 0, text);
            _this.text = textArray.join('');
            cursorPosition.set(_this.text, _this.depth, cursorIndex + text.length);
          }
          if (_this.mode !== 'command') _this.focus();
        } else {
          _this.text += text;
        }
        if (!_this.hasFocus) _this.render();
        _this.save();
      },
      addPrefix: function (text) {
        _this.text = text + _this.text;
        if (!_this.hasFocus) _this.render();
        _this.save();
      },
      removeText: function (text) {
        _this.text = _this.text.split(new RegExp(_.escapeRegExp(text || _this.text), 'g')).join('');
        _this.render();
        _this.save();
      },
      replaceText: function (text, newText) {
        _this.text = _this.text.split(new RegExp(_.escapeRegExp(text || _this.text), 'g')).join(newText || '');
        if (!_this.hasFocus) _this.render();
        _this.save();
      },
      changeText: function (text) {
        _this.text = text;
        _this.render();
        _this.save();
      },
      freezeComputedValue: function () {
        if (_this.valIsComputed) {
          _this.text = _this.text.split('[=]')[0] + '[:] ' + _this.val;
          _this.render();
          _this.save();
        }
      },
      template: (function(_this) {
        return function(key) {
          var nextUp, template, templates;
          if (_this.$items.length) {
            if (!confirm('Are you sure you want to overwrite the existing list?')) {
              return;
            }
          }
          templates = [];
          nextUp = _this.$$item('templates');
          while (nextUp) {
            templates.push(nextUp);
            nextUp = nextUp.$$item('templates');
          }
          var globalTemplates = userPreferences.$item('templates');
          if (globalTemplates) templates.push(globalTemplates);
          while (templates.length && !template) {
            template = templates.shift().$item(key);
          }
          if (template && template.$items.length === 1) {
            template = template.$items[0];
            _this.addText(template.text);
            _this.render();
          }
          if (template && template.$items.length) {
            _this.$items = _.map(template.$items, _.method('clone', _this));
            _this.renderChildren();
          } else if (template) {
            _this.text += template.valueOf();
          }
          _this.focus();
          _this.save();
        };
      })(this),
      makeTemplate: (function(_this) {
        return function(key) {
          var clone, templates;
          templates = _this.$$item('templates');
          if (!templates) {
            var topItem = _this.getTopItem();
            templates = new Item({
              text: 'templates',
              guid: getNewGuid(),
              $items: [],
              $parent: topItem
            });
            topItem.$items.unshift(templates);
            topItem.renderChildren();
          }
          clone = _this.clone(templates);
          if (key) {
            clone.text = key;
          }
          templates.$items.push(clone);
          templates.renderChildren();
          _this.save();
        };
      })(this),
      newItem: function () {
        var parent = _this.$parent;
        if (parent) {
          parent.addNewChildAfter(_this, "");
        } else {
          _this.addNewChildBefore(_this.items[0], "");
        }
      },
      addItem: function (text) {
        var newItem;
        if (isItem(text)) {
          newItem = text.clone(_this);
        } else {
          newItem = new Item({
            text: ('' + text) || '',
            guid: getNewGuid(),
            $items: [],
            $parent: _this
          });
        }
        _this.$items.push(newItem);
        newItem.refreshDepth();
        newItem.refreshSortOrder();
        _this.renderChildren();
      },
      addItems: function () {
        var args = _.flatten(arguments);
        if (isItem(args)) args = args.$items;
        _.each(args, function (text) {
          var newItem;
          if (isItem(text)) {
            newItem = text.clone(_this);
          } else {
            newItem = new Item({
              text: ('' + text) || '',
              guid: getNewGuid(),
              $items: [],
              $parent: _this
            });
          }
          _this.$items.push(newItem);
          newItem.refreshDepth();
          newItem.refreshSortOrder();
        });
        _this.renderChildren();
      },
      sort: function() {},
      copy: function() {},
      importFromCsv: (function(_this) {
        // TODO abstract file import into service
        return function(labelKey) {
          var input, onchange;
          input = $('input[type="file"]')[0];
          onchange = function(evnt) {
            var file, reader;
            file = input.files[0];
            input.removeEventListener('change', onchange);
            if (!file) {
              return;
            }
            reader = new FileReader();
            reader.onload = function(e) {
              // TODO wrap in transaction
              var data, headerRow, labelIndex;
              data = Papa.parse(e.target.result).data;
              headerRow = _.map(data.shift(), _.trim);
              labelIndex = labelKey ? headerRow.indexOf(labelKey) : 0;
              _this.$items = _.map(data, function(row) {
                var item;
                item = new Item({
                  guid: getNewGuid(),
                  text: row[labelIndex],
                  $parent: _this,
                  collapsed: true
                });
                item.$items = _.map(row, function(val, i) {
                  return new Item({
                    guid: getNewGuid(),
                    text: "" + headerRow[i] + " [:] " + val,
                    $parent: item
                  });
                });
                return item;
              });
              _this.save();
              _this.renderChildren();
            };
            reader.readAsText(file);
          };
          input.addEventListener('change', onchange);
          input.click();
        };
      })(this),
      importFromJson: _.bind(function () {}, this),
      parseJson: _.bind(function (json) {
        var text;
        if (json) text = this.text;
        var tree = jsonToItemTree(json || this.text, text);
        this.text = tree.text;
        this.$items = _.map(tree.$items, function (itemData) {
          return new Item(itemData);
        });
        this.renderChildren();
      }, this),
      exportAsText: (function(_this) {
        return function(options) {
          var computed, hideCollapsed;
          if (options == null) {
            options = {};
          }
          computed = options.computed, hideCollapsed = options.hideCollapsed;
          $('#export-display')
            .val(_this.toText(0, computed, hideCollapsed))
            .show();

          _.defer(function () {
            $('#export-display').focus().select();
          });
        };
      })(this),
      copyToClipboard: function () {
        var el = $(_this.toHTML())[0];
        $(document.body).append(el);
        copyToClipboard(el).then(function () {
          $(el).remove();
          _this.focus();
        });
      },
      copyItemsToClipboard: function () {
        this.copyItemsToClipboardAsText(); // TODO include formatting info
      },
      copyItemsToClipboardAsText: function () {
        var text = _.map(_this.$items, _.method('toText', 0)).join('');
        copyToClipboard(text).then(function () {
          _this.focus();
        });
      },
      copyToClipboardAsText: function () {
        copyToClipboard(_this.toText(0)).then(function () {
          _this.focus();
        });
      },
      copyToClipboardAsUncomputedText: function () {
        copyToClipboard(_this.toText(0, false)).then(function () {
          _this.focus();
        });
      },
      copyToClipboardAsMarkdown: function () {
        copyToClipboard(_this.toMarkdown(0)).then(function () {
          _this.focus();
        });
      },
      exportItemsAsText: function (options) {
        var computed, hideCollapsed;
        if (options == null) {
          options = {};
        }
        computed = options.computed, hideCollapsed = options.hideCollapsed;
        var text = _.map(_this.$items, _.method('toText', 0, computed, hideCollapsed)).join('');
        $('#export-display')
          .val(text)
          .show();

        _.defer(function () {
          $('#export-display').focus().select();
        });
      },
      exportAsMarkdown: (function(_this) {
        return function(options) {
          var computed, hideCollapsed;
          if (options == null) {
            options = {};
          }
          computed = options.computed, hideCollapsed = options.hideCollapsed;
          $('#export-display')
            .val(_this.toMarkdown(0, computed, hideCollapsed))
            .show();

          _.defer(function () {
            $('#export-display').focus().select();
          });
        };
      })(this),
      exportItemsAsMarkdown: function (options) {
        var computed, hideCollapsed;
        if (options == null) {
          options = {};
        }
        computed = options.computed, hideCollapsed = options.hideCollapsed;
        var text = _.map(_this.$items, _.method('toMarkdown', 0, computed, hideCollapsed)).join('\n');
        $('#export-display')
          .val(text)
          .show();

        _.defer(function () {
          $('#export-display').focus().select();
        });
      },
      downloadAsCsv: function () {
        var rows = _.map(_this.$items, function (item) {
          return _.reduce(item.$items, function (row, it) {
            row[it.key] = it.val;
            return row;
          }, {});
        });
        var csv = Papa.unparse(rows);
        downloadFile(csv, 'text/csv', _this.text + '.csv');
      },
      exportAsPDF: (function(_this) {
        return function() {};
      })(this),
      exportAsHTML: (function(_this) {
        return function() {};
      })(this),
      duplicate: function() {
        var dup;
        dup = _this.clone(_this.$parent);
        _this.$parent.insertAfter(dup, _this);
        dup.refreshSortOrder();
        _this.$parent.renderChildren();
        dup.focus();
        _this.handleBlur();
        _this.softRenderAll();
        _this.save();
      },
      expandAll: _.bind(this.expandRecursive, this, true),
      expandItemsRecursively: function () {
        this.expandAll();
      },
      collapseAll: _.bind(this.collapseRecursive, this, true),
      collapseSiblings: (function(_this) {
        return function() {
          _.each(_this.$parent.$items, function(item) {
            item.collapse();
          });
          _this.save();
          _this.focus();
        };
      })(this),
      collapseItemsRecursively: function () {
        if (_.every(_this.$items, function (item) {
          return item.collapsed || item.$items.length === 0;
        })) {
          _.noop();
          // this.collapseAll();
        } else {
          transaction.stall();
          Promise.all(_.map(_this.$items, function(item) {
            return item.collapseRecursive();
          })).then(transaction.end).catch(transaction.end);
        }
        _this.save();
        _this.focus();
      },
      toggleCollapseSiblings: function () {
        if (_this.collapsed) {
          this.expandSiblings();
        } else {
          this.collapseSiblings();
        }
      },
      expandSiblings: function() {
        _.each(_this.$parent.$items, function(item) {
          item.expand();
        });
        _this.save();
        _this.focus();
      },
      // TODO make this an item instance method
      indentSiblings: function () {
        var parent = _this.$parent;
        if (!parent) return;
        var index = parent.$items.indexOf(_this) + 1;
        _.invokeMap(parent.$items.slice(index), 'indent');
        parent.renderChildren();
        _this.save();
      },
      // indentStraight:
      // TODO make this an item instance method
      outdentStraight: function () {
        this.indentSiblings();
        _this.outdent();
        _this.$parent.renderChildren();
        _this.save();
        _this.focus();
      },
      slideOut: function () {
        this.outdentStraight();
      },
      outdentItems: function () {
        _.eachRight(_this.$items.slice(), _.method('outdent'));
        _this.$parent.renderChildren();
        _this.save();
      },
      sortItems: (function(_this) {
        return function(order) {
          _this.$items.sort(function(a, b) {
            a = a.valueOf();
            b = b.valueOf();
            if (a > b) {
              return 1;
            } else if (a < b) {
              return -1;
            }
            return 0;
          });
          if (_.includes(order, 'desc')) {
            _this.$items.reverse();
          }
          _this.save();
          _this.renderChildren();
        };
      })(this),
      sortItemsBy: (function(_this) {
        return function(sorter, order) {
          var previousItems;
          previousItems = _this.$items;
          try {
            _this.$items = _this.sortItemsBy(sorter);
            _this.$items.sortBy = previousItems.sortBy;
            if (_.includes(order, 'desc')) {
              _this.$items.reverse();
            }
            _this.save();
            _this.renderChildren();
          } catch (_error) {
            _this.$items = previousItems;
          }
        };
      })(this),
      groupItemsBy: (function(_this) {
        return function(grouper, options) {
          _this.groupItemsBy(grouper, options);
          _this.save();
          _this.renderChildren();
        };
      })(this),
      ungroup: (function(_this) {
        return function(groupAttribute) {
          var _ref;
          _this.ungroup(groupAttribute);
          _this.save();
          if ((_ref = _this.$parent) != null) {
            _ref.renderChildren();
          }
        };
      })(this),
      ungroupItems: (function(_this) {
        return function(groupAttribute) {
          _this.ungroupItems(groupAttribute);
          _this.save();
          _this.renderChildren();
        };
      })(this),
      pivotItems: function () {
        _this.pivotItems();
      },
      shuffleItems: (function(_this) {
        return function() {
          _this.$items = _.shuffle(_this.$items);
          _this.save();
          _this.renderChildren();
        };
      })(this),
      forEachItem: (function(_this) {
        return function(cmd) {
          _.each(_this.$items.slice(), _.method('executeCommand', cmd));
        };
      })(this),
      forEachItemRecursively: function (cmd) {
        var execCmd = _.method('executeCommand', cmd),
            recurse = function (items) {
              _.each(items, function (item) {
                execCmd(item);
                if (item.$items.length) recurse(item.$items.slice());
              });
            };
        recurse(_this.$items.slice());
      },
      flatten: function () {
        var parent = _this.$parent;
        if (!parent) return; // TODO
        // parent.$items.splice = _this._flatten();
      },
      reverseItems: function () {
        _this.$items.reverse();
        _.each(_this.$items, _.method('refreshSortOrder'));
        _this.save();
        _this.renderChildren();
      },
      generateList: _.noop,
      deleteItems: function() {
        _this.$items = [];
        _this.save();
        _this.renderChildren();
      },
      moveToList: function (listName) {
        var oldParent = _this.$parent,
            newParent = _this.$$item(listName) || window.topItem.$item(listName);
        if (newParent) {
          _this.$parent.removeChild(_this);
          newParent.$items.push(_this);
          _this.$parent = newParent;
          _this.refreshDepth();
          _this.refreshSortOrder();
          oldParent.renderChildren();
          newParent.renderChildren();
          _this.save();
        } else {
          // TODO
        }
      },
      splitToList: function (splitter, replacer) {
        _this.splitToList(splitter, replacer);
        _this.$parent.renderChildren();
        _this.save();
      },
      _delete: function() {
        _this.deleteItem(true);
      },
      undo: _.noop,
      redo: _.noop,
      // reverseText
      // upperCase
      // lowerCase
      // hideUntil: function (date) {

      // },
      headsOrTails: function () {
        var outcome = _.sample(['heads','tails']);
        if (_this.text) {
          var parent = _this.$parent || _this;
          parent.insertAfter(new Item({
            text: outcome,
            $items: [],
            $parent: parent,
            guid: getNewGuid()
          }), _this);
          parent.save();
          parent.renderChildren();
        } else {
          _this.text = outcome;
          _this.save();
        }
      },
      randomNumberBetween: function (x, y) {

      },
      // randomName
      randomTip: function () {

      },
      noop: _.noop,
      log: function () {
        var args = _.toArray(arguments);
        args.unshift(_this.toJSON(), _this);
        console.log.apply(console, args);
      },
      search: function (query) {

      },
      select: function (item) {
        if (_.isString(item) || _.isNumber(item)) {
          item = _this.$item(item) || _this.$$item(item);
        }
        window.requestAnimationFrame(function () {
          item && item.focus();
        });
      },
      selectParent: function () {
        window.requestAnimationFrame(function () {
          _this.$parent && _this.$parent.focus();
        });
      },
      down: function () {
        window.requestAnimationFrame(function () {
          _this.down();
        });
      },
      up: function () {
        window.requestAnimationFrame(function () {
          _this.up();
        });
      },
      // randomWord:
      // randomAdjective:
      // randomNoun:
      // randomAdverb:
      // randomVerb:
    };
    var itemMethods = [
      'zoomIn','zoomOut','moveUp','moveDown','toggleCollapse',
      'indent','outdent','expand','collapse',
    ];
    _.each(itemMethods, function (methodName) {
      cli[methodName] = _.flow(_.constant(_this), _.method(methodName));
    });
    var commandStringPieces = commandString.split(/([^\w\s]|\d)/);
    commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    if (commandStringPieces[0] === 'delete') commandStringPieces[0] = '_delete';
    if (_this.mode === 'command' && !_.isFunction(cli[commandStringPieces[0]]) ) {
      commandString = commandTypeahead.getTopMatch() || 'noop';
      commandStringPieces = commandString.split(/([^\w\s]|\d)/);
      commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    }
    var commandArgumentsString;
    if (commandStringPieces[0] === 'forEachItem' && commandStringPieces[1] === ',') {
      commandArgumentsString = '"' + commandStringPieces.slice(2).join('').replace(/"/g, '\\"') + '"';
    } else if (commandStringPieces[0] === 'forEachItemRecursively' && commandStringPieces[1] === ',') {
      commandArgumentsString = '"' + commandStringPieces.slice(2).join('').replace(/"/g, '\\"') + '"';
    } else {
      commandArgumentsString = commandStringPieces.slice(1).join('');
    }
    var commandFunction = cli[commandStringPieces[0]];
    var commandArguments = commandArgumentsString ? computeItemValue('[' + commandArgumentsString + ']', _this) : [];
    var mode = this.mode;
    transaction(function () {
      commandFunction.apply(cli, commandArguments);
    });
    if (mode === 'command') commandTypeahead.end(commandString);
  };

});
