(function (global, _) {

  _.each(['_','$','ss','katex','Backbone','Papa','UndoManager','Promise','Worker','jsondiffpatch','Clipboard','evalculist','d3','confetti'], function (vendor) {
    var obj = global[vendor] || _.noop;
    calculist.register(vendor, [], _.constant(obj));
    // delete global[vendor];
  });

})(this, _);
