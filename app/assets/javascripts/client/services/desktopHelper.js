// NOTE window.desktopHelper is defined in the desktop codebase.
calculist.register.apply(calculist, window.desktopHelper || [
  'desktopHelper', [], function () {
    var returnFalse = function () { return false; };
    return {
      isDesktop: returnFalse,
      isRelativeFilepath: returnFalse,
    };
  }
]);
