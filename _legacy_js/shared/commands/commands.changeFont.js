calculist.register('commands.changeFont',['_','$'], function (_, $) {
  return function (_this, fontName) {
    $(document.body).append(
      '<style>' +
        '@import url(https://fonts.googleapis.com/css?family=' + fontName.split(' ').join('+') + ');' +
        '#main-container {' +
          'font-family: "' + fontName + '", "Ubuntu Mono", courier, monospace;' +
        '}' +
        '#main-container .input {' +
          'font-family: "' + fontName + '", "Ubuntu Mono", courier, monospace;' +
        '}' +
        '#main-container #command-typeahead-menu {' +
          'font-family: "' + fontName + '", "Ubuntu Mono", courier, monospace;' +
        '}' +
      '</style>'
    );
  };
});
