import eventHub from './eventHub';

const computationIsPaused = (function (eventHub) {
  var isPaused = false;
  var computationIsPaused = function () {
    return isPaused;
  };

  computationIsPaused.pause = function () {
    if (isPaused) return;
    isPaused = true;
    eventHub.trigger('pauseComputation');
  };

  computationIsPaused.resume = function () {
    if (!isPaused) return;
    isPaused = false;
    eventHub.trigger('resumeComputation');
  };

  return computationIsPaused;
})(eventHub);

export default computationIsPaused;
