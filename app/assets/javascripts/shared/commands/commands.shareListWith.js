calculist.register('commands.shareListWith', ['Backbone', '_'], function (Backbone, _) {
  return _.rest(function (_this, usernames) {
    if (!window.LIST_ID /* desktop app */) return;
    usernames = _.flatten(usernames);
    var shares = new Backbone.Model({
      usernames: usernames
    });
    shares.url = '/lists/' + window.LIST_ID  + '/list_shares';
    shares.save({
      success: function (m, response) { alert(response.message); }
    });
  });
});
