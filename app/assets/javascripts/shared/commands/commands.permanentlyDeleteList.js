calculist.register('commands.permanentlyDeleteList', ['http'], function (http) {
  return function (_this, listTitle) {
    listTitle || (listTitle = _this.valueOf());
    var list = _.find(window.OTHER_LISTS, function (list) {
      return list.title === listTitle;
    });
    if (list && list.handle === 'preferences') {
      alert('Cannot delete preferences list');
    } else if (list && window.confirm('Are you sure? This cannot be undone.')) {
      http.delete('/lists/' + list.id).then(function (response) {
        alert(response.message);
      }).catch(function (xhr) {
        alert(xhr.responseJSON.message);
      })
    } else {
      alert('Could not find list titled "' + listTitle + '"');
    }
  }
});
