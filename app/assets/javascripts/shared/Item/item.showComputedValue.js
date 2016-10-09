calculist.require(['Item'], function (Item) {

  // TODO Make a constants service
  var ERROR_VAL = '#ERROR!';

  Item.prototype.showComputedValue = function() {
    var $cd, val;
    if (this.hasFocus) {
      this.valueOf();
      val = this.val;
      if (this.valIsComputed) {
        val = this.formatVal(val);
        $cd = this.$("#computed-display" + this.id);
        $cd.text("" + val).css({
          'margin-left': -$cd.width()
        });
        if (val === ERROR_VAL) {
          $cd.addClass('error');
        } else {
          $cd.removeClass('error');
        }
        this.computedDisplayIsVisible = true;
      }
    } else {
      var previousVal = this.val;
      this.$("#computed-display" + this.id).text('');
      this.computedDisplayIsVisible = false;
      this.$("#input" + this.id).html(this.getComputedHTML());
      if (this.valIsComputed) {
        if (_.isNaN(this.val)) {
          this.$('.value:first').addClass('error');
        } else if (_.isNaN(previousVal)) {
          this.$('.value.error:first').removeClass('error');
        }
      }
    }
  };

});
