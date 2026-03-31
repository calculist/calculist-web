import _ from 'lodash';
import Backbone from 'backbone';

const eventHub = (function (_, Backbone) {

  var eventHub = _.extend({}, Backbone.Events);

  return eventHub;

})(_, Backbone);

export default eventHub;
