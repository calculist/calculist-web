calculist.register('syncAnimationFrame', ['_'], function (_) {

  var animationFrame, isRefeshing;

  var requestAnimationFrame = window.requestAnimationFrame || function (cb) { _.defer(cb, _.now()); };

  var refreshAnimationFrame = function () {
    if (isRefeshing) return;
    isRefeshing = true;
    requestAnimationFrame(function (af) {
      animationFrame = af;
      isRefeshing = false;
    });
  };

  refreshAnimationFrame();

  return function () {
    refreshAnimationFrame();
    return animationFrame;
  };

});
