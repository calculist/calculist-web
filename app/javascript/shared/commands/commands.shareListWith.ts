import Backbone from 'backbone';
import _ from 'lodash';
import { commands_stopSharingList, commands_stopSharingListWith } from './commands.stopSharingListWith';

const commands_shareListWith = (function (Backbone: any, _: any) {
  return _.rest(function (_this: any, usernames: any[]) {
    if (!(window as any).LIST_ID /* desktop app */) return;
    usernames = _.flatten(usernames);
    var shares = new Backbone.Model({
      usernames: usernames
    });
    shares.url = '/lists/' + (window as any).LIST_ID  + '/list_shares';
    shares.save(null, {
      success: function (m: any, response: any) {
        usernames = _.map(response, 'username');
        alert('successfully shared with ' + usernames.join(', '));
      },
      error: function () {
        alert('something went wrong. sharing failed.')
      }
    });
  });
})(Backbone, _);

// Aliases
const commands_shareDocumentWith = commands_shareListWith;
const commands_stopSharingDocument = commands_stopSharingList;
const commands_stopSharingDocumentWith = commands_stopSharingListWith;

export { commands_shareListWith, commands_shareDocumentWith, commands_stopSharingDocument, commands_stopSharingDocumentWith };
