lm.register('commands.goHome', ['_'], function (_) {
  return function (_this) {
    window.topItem.saveNow().then(function () {
      window.location.assign('/');
    }).catch(function () {
      alert('saving failed');
    })
  };
});
