calculist.register('exportDisplay', ['_','$'], function (_, $) {

    var $el = $('#export-display');
    $el.on('keydown', function (e) {

      var ESC = 27;
      if (e.which === ESC) $el.hide();

    });

    return {
      show: function (text) {
        $el.text(text).show() ;
      },
      hide: function () {
        $el.hide();
      }
    };

});
