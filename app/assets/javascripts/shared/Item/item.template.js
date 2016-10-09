calculist.register('item.template', ['_','isReadOnly'], function (_, isReadOnly) {

  return _.template(
    '<div class="computed-display" id="computed-display<%= id %>"></div>' +
    // '<input id="command-input<%= id %>" type="text" style="display:none;float:left;width:100%;">' +
    '<div class="dot <%= collapsed ? "collapsed" : "" %>" id="dot<%= id %>"></div>' +
    '<pre id="input<%= id %>" class="input"' + (isReadOnly() ? '' : ' contenteditable="true"') + '><%= (text || "") %></pre>' +
    // '<ul id="typeahead<%= id %>" style="display:none;position:absolute;width:100%;"></ul>' +
    '<ul id="list<%= id %>"></ul>'
  );

});
