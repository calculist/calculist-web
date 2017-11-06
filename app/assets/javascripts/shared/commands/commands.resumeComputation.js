calculist.register('commands.resumeComputation', ['computationIsPaused'], function (computationIsPaused) {
  return function () {
    computationIsPaused.resume();
  };
});
