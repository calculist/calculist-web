calculist.register('userAgentHelper', [], function () {
  return {
    isMobileDevice: navigator.userAgent.toLowerCase().match(/mobile/i)
  };
});
