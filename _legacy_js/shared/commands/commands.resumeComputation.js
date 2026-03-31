calculist.register('commands.resumeComputation', ['computationIsPaused'], function (computationIsPaused) {
  return function () {
    computationIsPaused.resume();
  };
});

calculist.register('commands.unpauseComputation', ['commands.resumeComputation'], _.identity);
