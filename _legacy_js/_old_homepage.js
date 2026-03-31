//= require jquery
//= require jquery_ujs
//= require lodash/lodash
//= require backbone/backbone
//= require_self

$('#sign-out').on('click', function() {
  var session = new Backbone.Model();
  session.url = '/logout';
  session.isNew = _.constant(false);
  session.destroy({
    success: function() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  });
});
