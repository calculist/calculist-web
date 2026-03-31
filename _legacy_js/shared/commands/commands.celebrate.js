calculist.register('commands.celebrate', ['confetti', 'headerMessage'], function (confetti, headerMessage) {
  return function (_this, message) {
    if (message) headerMessage.flashMessage(message, 6000);
    confetti.start(3000, 300);
  };
});
