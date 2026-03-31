calculist.register('commands.disableSpellcheck', [], function () {
  return function (_this) {
    _this.$el.attr('spellcheck', 'false');
  };
});

calculist.register('commands.enableSpellcheck', [], function () {
  return function (_this) {
    _this.$el.attr('spellcheck', 'true');
  };
});
