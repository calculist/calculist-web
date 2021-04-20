calculist.register('userIsTyping', ['_','eventHub'], function (_, eventHub) {

  var UP_KEY = 38, DOWN_KEY = 40;

  var _userIsTyping = false,
      reset = _.debounce(function () {
        _userIsTyping = false;
        eventHub.trigger('userStoppedTyping');
        // console.log('userStoppedTyping');
        // window.topItem.softRenderAll();
      }, 1200);

  eventHub.on('item.handleKeydown:before', function (item, args) {
    var e = args[0];
    if (e.which === UP_KEY || e.which === DOWN_KEY) {
      reset.flush();
      return;
    } else if (!_userIsTyping) {
      _userIsTyping = true;
      eventHub.trigger('userStartedTyping');
      // console.log('userStartedTyping');
    }
    reset();
  });

  eventHub.on('item.handleBlur:before', reset.flush);

  return function () {
    return _userIsTyping;
  };

});
