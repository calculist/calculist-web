import _ from 'lodash';
import isReadOnly from '../../client/services/isReadOnly';
import userAgentHelper from '../../client/services/userAgentHelper';

const item_template = (function (_, isReadOnly, userAgentHelper) {
  var isMobileDevice = userAgentHelper.isMobileDevice;
  return _.template(
    '<div class="input-container">' +
      '<div class="computed-display" id="computed-display<%= id %>"></div>' +
      '<div class="dot <%= collapsed ? "collapsed" : "" %>" id="dot<%= id %>"></div>' +
      '<pre id="input<%= id %>" class="input<%= focus ? " focus" : "" %>"' +
        (isReadOnly() || isMobileDevice ? 'contenteditable="<%= contenteditable %>"' : ' contenteditable="true"') + '><%= (text || "") %></pre>' +
    '</div>' +
    '<ul id="list<%= id %>"></ul>'
  );

})(_, isReadOnly, userAgentHelper);

export default item_template;
