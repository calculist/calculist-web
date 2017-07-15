calculist.register('commands.stopSharingListWith', ['http', '_'], function (http, _) {
  return _.rest(function (_this, usernames) {
    if (!window.LIST_ID /* desktop app */) return;
    usernames = _.flatten(usernames);
    var url = '/lists/' + window.LIST_ID  + '/list_shares';
    var getUrl = usernames.length === 0 ? url : url + '?usernames=' + encodeURIComponent(JSON.stringify(usernames));
    http.get(getUrl).then(function (response) {
      _.each(response, function (share) {
        http.delete(url + '/' + share.id);
      })
    });
  });
});

calculist.register('commands.stopSharingList', ['commands.stopSharingListWith'], _.identity);
