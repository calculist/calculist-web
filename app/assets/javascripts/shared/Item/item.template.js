calculist.register('item.template', ['_','isReadOnly'], function (_, isReadOnly) {

  return _.template(
    '<div class="input-container">' +
      '<div class="computed-display" id="computed-display<%= id %>"></div>' +
      '<div class="dot <%= collapsed ? "collapsed" : "" %>" id="dot<%= id %>"></div>' +
      '<pre id="input<%= id %>" class="input<%= focus ? " focus" : "" %>"' + (isReadOnly() ? '' : ' contenteditable="true"') + '><%= (text || "") %></pre>' +
    '</div>' +
    '<ul id="list<%= id %>"></ul>'
  );

});
