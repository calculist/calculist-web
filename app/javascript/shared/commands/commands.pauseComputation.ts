import computationIsPaused from '../../client/services/computationIsPaused';

const commands_pauseComputation = (function (computationIsPaused) {
  return function () {
    computationIsPaused.pause();
  };
})(computationIsPaused);

export default commands_pauseComputation;
