(function (global, _) {

  _.each(['_','$','ss','katex','Backbone','Papa','UndoManager','Promise','Worker','jsondiffpatch','Clipboard'], function (vendor) {
    var obj = global[vendor] || _.noop;
    lm.register(vendor, [], _.constant(obj));
    // delete global[vendor];
  });

})(this, _);