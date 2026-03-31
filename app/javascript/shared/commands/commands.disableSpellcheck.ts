const commands_disableSpellcheck = (function () {
  return function (_this) {
    _this.$el.attr('spellcheck', 'false');
  };
})();

const commands_enableSpellcheck = (function () {
  return function (_this) {
    _this.$el.attr('spellcheck', 'true');
  };
})();

export { commands_disableSpellcheck, commands_enableSpellcheck };
