lm.register('removeHTML', [], function () {

  return function (string) {
    return ('' + string).replace(/<(?:.|\n)*?>/gm, '');
  };

});
