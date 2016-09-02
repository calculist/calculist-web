lm.require(['Item','$'], function (Item, $) {

  Item.prototype.save = function() {
    $('#save-status').text('unsaved changes');
    // localStorage.changeText = JSON.stringify({
    //   guid: this.guid,
    //   text: this.text
    // });
    this.getTopItem().save();
  };

});
