/**
 * Homepage entry point — just handles sign-out.
 */
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';

// Set up CSRF token for AJAX requests (replaces jquery_ujs)
$.ajaxSetup({
  beforeSend: function(xhr: any) {
    var token = $('meta[name="csrf-token"]').attr('content');
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
  }
});

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
