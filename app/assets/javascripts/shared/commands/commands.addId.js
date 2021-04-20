calculist.register('commands.addId', [], function () {
  var getRandomId = function () {
    var randInt = (Math.random() * Math.pow(16, 6)) | 0;
    return randInt.toString(16);
  }
  return function (_this, item) {
    _this.addText(" \\id[" + getRandomId() + "]");
  };
});
