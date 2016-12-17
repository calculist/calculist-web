calculist.register('getAndApplyChangesFromServer', ['_','http','getItemByGuid','Item'], function (_, http, getItemByGuid, Item) {
  var lastSave = window.INITIAL_LAST_SAVE,
      url = function (path) { return window.location.origin + path; },
      newItemFromData = function (data) {
        return new Item({
          guid: data.guid,
          text: data.text,
          collapsed: data.is_collapsed,
          parent: getItemByGuid(data.parent_guid),
          items: null
        });
      },
      addToParentItemsAtCorrectIndex = function (item, parent) {
        var index = _.sortedIndex(parent.items, item, 'sort_order');
        parent.insertAt(item, index);
      };

  return function (alternateLastSave) {
    if (alternateLastSave > lastSave) lastSave = alternateLastSave;
    return http.get(url('/lists/' + window.LIST_ID), {
      last_save: lastSave
    }).then(function (response) {
      if (response.new_items.length || response.updated_items.length) {
        // console.log('new changes', response);
      } else {
        // console.log('no new changes');
      }
      lastSave = response.last_save;
      // TODO abstract this function into multiple services
      if (response.new_items.length || response.updated_items.length) {
        var needToReRender = false;
        var newItems = _.filter(response.new_items, function (newItemData) {
          return !getItemByGuid(newItemData.guid);
        });
        needToReRender = newItems.length > 0;
        var parentsByGuid = {}, previousLength = newItems.length + 1;
        while (newItems.length && newItems.length < previousLength) {
          previousLength = newItems.length;
          newItems = _.filter(newItems, function (newItemData) {
            var parent = getItemByGuid(newItemData.parent_guid);
            if (!parent) return true;
            parentsByGuid[parent.guid] = parent;
            var newItem = newItemFromData(newItemData);
            addToParentItemsAtCorrectIndex(newItem, parent);
          });
        }
        // if (newItems.length) throw('cannot resolve new items');
        _.each(response.updated_items, function (updatedItemData) {
          var item = getItemByGuid(updatedItemData.guid);
          if (updatedItemData.is_deleted) {
            item.parent.removeChild(item);
            parentsByGuid[item.parent.guid] = item.parent;
            needToReRender = true;
            return;
          }
          if (item.parent && item.parent.guid !== updatedItemData.parent_guid) {
            item.parent.removeChild(item);
            parentsByGuid[item.parent.guid] = item.parent;
            var newParent = getItemByGuid(updatedItemData.parent_guid);
            addToParentItemsAtCorrectIndex(item, newParent);
            parentsByGuid[newParent.guid] = newParent;
            needToReRender = true;
          }
          if (item.sort_order !== updatedItemData.sort_order) {
            item.sort_order = updatedItemData.sort_order;
            item.parent.removeChild(item);
            addToParentItemsAtCorrectIndex(item, item.parent);
            parentsByGuid[item.parent.guid] = item.parent;
            needToReRender = true;
          }
          if (item.text !== updatedItemData.text) {
            item.text = updatedItemData.text;
            item.$('#input' + item.id).text(item.text);
          }
        });
        if (needToReRender) {
          window.topItem.refreshDepth();
          _.each(parentsByGuid, function (parent) {
            parent.render();
          });
        }
      }
      return response;
    });
  };

});
