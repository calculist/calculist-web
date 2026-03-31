var $ = function(selector) {
  var chain = {
    text: function() { return ''; },
    html: function() { return ''; },
    addClass: function() { return chain; },
    removeClass: function() { return chain; },
    removeAttr: function() { return chain; },
    blur: function() { return chain; },
    focus: function() { return chain; },
    offset: function() { return chain; },
    height: function() { return 0; },
    on: function() { return chain; },
    off: function() { return chain; },
    remove: function() { return chain; },
    insertAfter: function() { return chain; },
    attr: function() { return null; },
    find: function() { return chain; },
    append: function() { return chain; },
    prepend: function() { return chain; },
    empty: function() { return chain; },
    val: function() { return ''; },
    css: function() { return chain; },
    hide: function() { return chain; },
    show: function() { return chain; },
    parent: function() { return chain; },
    children: function() { return chain; },
    eq: function() { return chain; },
    first: function() { return chain; },
    last: function() { return chain; },
    closest: function() { return chain; },
    data: function() { return null; },
    prop: function() { return null; },
    is: function() { return false; },
    each: function() { return chain; },
    map: function() { return chain; },
    get: function() { return []; },
    length: 0,
    0: undefined,
  };
  return chain;
};
$.extend = Object.assign;
$.ajax = function() { return { done: function() { return { fail: function() {} }; } }; };
$.ajaxSetup = function() {};

module.exports = $;
module.exports.default = $;
module.exports.__esModule = true;
