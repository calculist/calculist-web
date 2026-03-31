calculist.register('commands.goHome', ['_'], function (_) {
  return function (_this) {
    if (!window.LIST_ID /* desktop app */) return;
    window.topItem.saveNow().then(function () {
      window.location.assign('/');
    }).catch(function () {
      alert('saving failed');
    })
  };
});
