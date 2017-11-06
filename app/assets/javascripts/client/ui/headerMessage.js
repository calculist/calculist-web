calculist.register('headerMessage', ['_','eventHub'], function (_, eventHub) {

  var COMPUTATION_IS_PAUSED = 'computation is paused';
  var COPIED = 'copied!'

  var element, previousMessages = [];
  var getElement = function () {
    element || (element = $('.header-message'));
    if (!element[0]) {
      $('#header').append('<div class="header-message"></div>');
      element = $('.header-message');
    }
    return element;
  };

  eventHub.on('pauseComputation', function () {
    var el = getElement();
    previousMessages.push(el.html());
    el.html(COMPUTATION_IS_PAUSED);
  });

  eventHub.on('resumeComputation', function () {
    var el = getElement();
    el.html(previousMessages.pop() || '');
  });

  eventHub.on('copyToClipboard', function () {
    var el = getElement();
    previousMessages.push(el.html());
    el.html(COPIED);
    _.delay(function () {
      el.html(previousMessages.pop() || '');
    }, 2000)
  });

  return {}; // TODO add API as needed
});
