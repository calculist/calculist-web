import _ from 'lodash';

const commands_goHome = (function (_) {
  return function (_this) {
    if (!window.LIST_ID /* desktop app */) return;
    window.topItem.saveNow().then(function () {
      window.location.assign('/');
    }).catch(function () {
      alert('saving failed');
    })
  };
})(_);

export default commands_goHome;
