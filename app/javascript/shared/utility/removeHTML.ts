const removeHTML = (function () {

  return function (string) {
    return ('' + string).replace(/<(?:.|\n)*?>/gm, '');
  };

})();

export default removeHTML;
