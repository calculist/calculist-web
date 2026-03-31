import _ from 'lodash';
import $ from 'jquery';

const http = (function (Promise, _, $) {

  'use strict';

  var http: any = {};

  http.request = function (method, url, params, options) {
    options || (options = {});
    return new Promise(function (resolve, reject) {
      $.support.cors = true;
      $.ajax({
        type: method,
        url: url,
        contentType: options.contentType || "application/json; charset=utf-8",
        dataType: options.dataType || 'json',
        processData: true,
        data: params,
        success: resolve,
        error: reject
      });
    });
  };

  _.each(['get','post','put','delete'], function (method) {
    http[method] = _.partial(http.request, method);
  });

  return http;

})(Promise, _, $);

export default http;
