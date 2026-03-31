calculist.register('commands.pauseComputation', ['computationIsPaused'], function (computationIsPaused) {
  return function () {
    computationIsPaused.pause();
  };
});
