calculist.require(['Item','removeHTML','_'], function (Item, removeHTML, _) {

  Item.prototype.getComputedText = function() {
    this.valueOf();
    var val = this.val,
        text;
    if (val != null) {
      if (this.key) {
        text = "" + removeHTML(this.formatKey(this.key)) + ": " + removeHTML(this.formatVal(val));
      } else {
        text = removeHTML(this.formatVal(val));
      }
    } else {
      text = removeHTML(this.formatVal(this.key));
    }
    return _.unescape(text);
  };

  Item.prototype.getComputedHTML = function() {
    var val;
    this.valueOf();
    val = this.val;
    if (val != null) {
      if (_.isPlainObject(val) && val.toHTML) {
        val = val.toHTML();
      } else {
        val = this.formatVal(val);
      }
      val = "<span class='value'>" + val + "</span>";
      if (this.key) {
        return "<span class='key'>" + (this.formatKey(this.key)) + "</span>: " + val;
      } else {
        return val;
      }
    } else {
      return this.formatKey(this.key);
    }
  };

});
