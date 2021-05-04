calculist.register('headerMessage', ['_','eventHub', 'emojiHelper'], function (_, eventHub, emojiHelper) {

  var DEFAULT_MESSAGE = '';
  var COMPUTATION_IS_PAUSED = 'computation is paused';
  var COPIED = 'copied!'

  var element, previousMessages = [];
  var getElement = function () {
    element || (element = $('.header-message'));
    if (!element[0]) {
      $('#header').append('<div class="header-message">' + DEFAULT_MESSAGE + '</div>');
      element = $('.header-message');
    }
    return element;
  };

  eventHub.on('pauseComputation', function () {
    var el = getElement();
    previousMessages.push(el.html());
    el.html(COMPUTATION_IS_PAUSED);
    $('#main-container').addClass('computation-paused');
  });

  eventHub.on('resumeComputation', function () {
    var el = getElement();
    el.html(previousMessages.pop() || '');
    $('#main-container').removeClass('computation-paused');
  });

  eventHub.on('copyToClipboard', function () {
    var el = getElement();
    previousMessages.push(el.html());
    el.html(COPIED);
    _.delay(function () {
      el.html(previousMessages.pop() || '');
    }, 2000)
  });

  eventHub.on('needClickToConfirmCopy', function (button) {
    getElement().append(button);
  })

  return {
    flashMessage: function (message, duration) {
      var el = getElement();
      previousMessages.push(el.html());
      el.text(message);
      _.delay(function () {
        el.html(previousMessages.pop() || '');
      }, duration || 2000);
    }
  };
});
