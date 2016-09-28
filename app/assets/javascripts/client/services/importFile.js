lm.register('importFile', ['$'], function ($) {
  return function (callback) {
    var input = $('input[type="file"]')[0];
    var onchange = function(evnt) {
      var file = input.files[0];
      input.removeEventListener('change', onchange);
      if (!file) {
        return callback();
      }
      var reader = new FileReader();
      reader.onload = function(e) {
        callback(e.target.result);
      };
      reader.readAsText(file);
    };
    input.addEventListener('change', onchange);
    input.click();
  };
});
