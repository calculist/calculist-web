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
    this.valueOf();
    var val = this.val;
    if (val != null) {
      if ((_.isPlainObject(val) || _.isFunction(val)) && val.toHTML) {
        val = val.toHTML();
      } else {
        val = this.formatVal(val);
      }
      val = "<span class='value'>" + val + "</span>";
      if (this.key) {
        var formatedKey = this.formatKey(this.key);
        var s1 = this.text[this.key.length] === ' ' ? ' ' : '';
        var s2 = this.text[
          this.key.length + s1.length + this.parsedText.separator.length
        ] === ' ' ? ' ' : '';
        var sep = '';
        if (this.parsedText.separator === '\\(') {
          //
        } else {
          sep = "<span class='separator'>" + this.parsedText.separator.replace('\\', '') + "</span>";
        }
        // TODO parse function separator properly
        return "<span class='key'>" + formatedKey + "</span>" + s1 + sep + s2 + val;
      } else {
        return val;
      }
    } else {
      return this.formatKey(this.key);
    }
  };

});
