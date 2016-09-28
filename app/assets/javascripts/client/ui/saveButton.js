lm.register('saveButton', ['_','$'], function (_, $) {

  var $el = $('#save-status');

  var currentStatus = 'saved';

  var render = function () {
    if (currentStatus === 'saved') {
      $el.text('saved').css({
        cursor: 'default',
        backgroundColor: 'transparent',
        color: ''
      });
    } else if (currentStatus === 'save') {
      $el.text('save').css({
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: ''
      });
    } else if (currentStatus === 'saving failed') {
      $el.text('saving failed').css({
        cursor: 'pointer',
        backgroundColor: 'red',
        color: '#fff'
      });
      _.times(3, function () {
        $el.fadeTo(100, 0).fadeTo(100, 1.0);
      });
    }
  };

  return {
    onClick: function (callback) {
      $el.on('click', function (e) {
        if (currentStatus === 'save' || currentStatus === 'saving failed') {
          return callback(e);
        }
      });
    },
    changeStatus: function (newStatus) {
      currentStatus = newStatus;
      render();
    },
    hide: function () {
      $el.hide();
    },
    show: function () {
      $el.show();
    }
  };

});
