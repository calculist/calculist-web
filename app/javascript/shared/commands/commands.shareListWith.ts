import Backbone from 'backbone';
import _ from 'lodash';
import commands_shareListWith from './commands.shareListWith';
import commands_stopSharingList from './commands.stopSharingListWith';
import commands_stopSharingListWith from './commands.stopSharingListWith';

const commands_shareListWith = (function (Backbone, _) {
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
})(Backbone, _);

const commands_shareDocumentWith = (_.identity)(commands_shareListWith);

const commands_stopSharingDocument = (_.identity)(commands_stopSharingList);

const commands_stopSharingDocumentWith = (_.identity)(commands_stopSharingListWith);

export { commands_shareListWith, commands_shareDocumentWith, commands_stopSharingDocument, commands_stopSharingDocumentWith };
