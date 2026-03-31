calculist.register('eventHub', ['_','Backbone'], function (_, Backbone) {

  var eventHub = _.extend({}, Backbone.Events);

  return eventHub;

});
