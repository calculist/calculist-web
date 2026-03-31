import http from '../../client/http';
import _ from 'lodash';

const commands_stopSharingListWith = (function (http, _) {
  return _.rest(function (_this, usernames) {
    if (!window.LIST_ID /* desktop app */) return;
    usernames = _.flatten(usernames);
    var url = '/lists/' + window.LIST_ID  + '/list_shares';
    var getUrl = usernames.length === 0 ? url : url + '?usernames=' + encodeURIComponent(JSON.stringify(usernames));
    http.get(getUrl).then(function (response) {
      return Promise.all(_.map(
        response, function (share) { return http.delete(url + '/' + share.id); }
      )).then(function () {
        usernames = _.map(response, 'username');
        alert('successfully stopped sharing with ' + usernames.join(', '));
      });
    }).catch(function () {
      alert('something went wrong.');
    });
  });
})(http, _);

const commands_stopSharingList = (_.identity)(commands_stopSharingListWith);

export { commands_stopSharingListWith, commands_stopSharingList };
