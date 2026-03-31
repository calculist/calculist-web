calculist.register('importFile', ['$', 'Promise'], function ($, Promise) {
  return function () {
    return new Promise(function (resolve, reject) {
      var input = $('input[type="file"]')[0];
      var onchange = function(evnt) {
        var file = input.files[0];
        input.removeEventListener('change', onchange);
        if (!file) {
          return resolve();
        }
        var reader = new FileReader();
        reader.onload = function(e) {
          resolve(e.target.result);
        };
        reader.readAsText(file);
      };
      input.addEventListener('change', onchange);
      input.click();
    });
  };
});
