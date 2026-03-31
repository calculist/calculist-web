const userAgentHelper = (function () {
  return {
    isMobileDevice: navigator.userAgent.toLowerCase().match(/mobile/i)
  };
})();

export default userAgentHelper;
