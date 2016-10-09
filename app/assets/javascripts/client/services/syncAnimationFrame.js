calculist.register('syncAnimationFrame', [], function () {

  var animationFrame, isRefeshing;

  var refreshAnimationFrame = function () {
    if (isRefeshing) return;
    isRefeshing = true;
    window.requestAnimationFrame(function (af) {
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
