import _ from 'lodash';
import $ from 'jquery';

const saveButton = (function (_: any, $: any) {

  // Lazy DOM element — resolved on first use since module loads before DOM ready
  var $el: any;
  var getEl = function() {
    if (!$el || !$el.length) $el = $('#save-status');
    return $el;
  };

  var currentStatus = 'saved';

  var render = function () {
    var el = getEl();
    if (currentStatus === 'saved') {
      $('#header').attr({style: ''});
      el.text('saved').css({
        cursor: 'default',
        backgroundColor: 'transparent',
        color: ''
      });
    } else if (currentStatus === 'save') {
      el.text('save').css({
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: ''
      });
    } else if (currentStatus === 'saving failed') {
      $('#header').css({opacity:1});
      el.text('saving failed').css({
        cursor: 'pointer',
        backgroundColor: 'red',
        color: '#fff'
      });
      _.times(3, function () {
        el.fadeTo(100, 0).fadeTo(100, 1.0);
      });
    }
  };

  return {
    onClick: function (callback: any) {
      getEl().on('click', function (e: any) {
        if (currentStatus === 'save' || currentStatus === 'saving failed') {
          return callback(e);
        }
      });
    },
    changeStatus: function (newStatus: string) {
      currentStatus = newStatus;
      render();
    },
    hide: function () {
      getEl().hide();
    },
    show: function () {
      getEl().show();
    }
  };

})(_, $);

export default saveButton;
