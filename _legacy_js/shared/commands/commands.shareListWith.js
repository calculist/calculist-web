calculist.register('commands.shareListWith', ['Backbone', '_'], function (Backbone, _) {
  return _.rest(function (_this, usernames) {
    if (!window.LIST_ID /* desktop app */) return;
    usernames = _.flatten(usernames);
    var shares = new Backbone.Model({
      usernames: usernames
    });
    shares.url = '/lists/' + window.LIST_ID  + '/list_shares';
    shares.save(null, {
      success: function (m, response) {
        usernames = _.map(response, 'username');
        alert('successfully shared with ' + usernames.join(', '));
      },
      error: function () {
        alert('something went wrong. sharing failed.')
      }
    });
  });
});

calculist.register('commands.shareDocumentWith', ['commands.shareListWith'], _.identity)
calculist.register('commands.stopSharingDocument', ['commands.stopSharingList'], _.identity)
calculist.register('commands.stopSharingDocumentWith', ['commands.stopSharingListWith'], _.identity)
