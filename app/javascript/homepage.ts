/**
 * Homepage entry point — just handles sign-out.
 */
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';

$('#sign-out').on('click', function() {
  var session = new (Backbone as any).Model();
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
