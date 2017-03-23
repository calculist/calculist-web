calculist.register('item.applyLocalStyle',['_'], function (_) {

  var backgroundMap = {
    blue: 'deepskyblue',
    red: 'crimson',
    yellow: 'yellow',
    green: 'forestgreen',
    orange: 'orange',
    purple: 'purple',
    tan: 'burlywood',
    pink: 'hotpink',
    lightpink: 'lightpink',
  }

  return function(localVars) {
    localVars || (localVars = this.localVars);
    if (!localVars) return;
    var $input, style;
    if (localVars.hasOwnProperty('$background')) {
      var background = backgroundMap[localVars.$background];
      $input || ($input = this.$('#input' + this.id));
      style || (style = $input[0].style);
      style.background = background || null;
    }
    if (localVars.hasOwnProperty('$hidden')) {
      // TODO Actually hide the item
      if (localVars.$hidden) {
        this.$el.css({opacity: 0.2});
      } else {
        this.$el.css({opacity: 1});
      }
    }
  };

});
