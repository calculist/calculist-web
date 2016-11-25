var window = this;
window.sessionStorage || (window.sessionStorage = {});
window.calculist = (function (_) {

  'use strict';

  var graph = {};

  var vertices = {},
      getVertex = _.propertyOf(vertices),
      queue = [],
      initialized = false;

  var processQueue = function () {
    var connectVertices = _.spread(function (name, dependencies, initializer) {
      var resolvedDependencies = _.compact(_.map(dependencies, getVertex));
      if (resolvedDependencies.length < dependencies.length) {
        return false;
      } else if (name) {
        if (vertices[name]) throw new Error('Naming collision for "' + name + '"');
        vertices[name] = initializer.apply(null, resolvedDependencies);
        if (!vertices[name]) throw new Error('Attempted to register a falsy value for "' + name + '"');
        return true;
      } else {
        initializer.apply(null, resolvedDependencies);
        return true;
      }
    });
    var connected = [1];
    while (connected.length > 0) connected = _.remove(queue, connectVertices);
    if (queue.length) {
      var notFound = _.uniq(_.reject(_.flatten(_.map(queue, '1')), getVertex));
      var getDependents = function (dependencies) {
        return _.map(_.filter(queue, _.spread(function (name, _dependencies) {
          return _.intersection(dependencies, _dependencies).length > 0;
        })), _.spread(function (name) { return name || '[require]'; }));
      };
      var dependents = getDependents(notFound);
      var culprits = _.difference(notFound, dependents);
      if (culprits.length === 0) {
        var dByN = _.reduce(queue, function (h, s) {
          if (getVertex(s[0])) return h;
          h[s[0]] = s[1];
          return h;
        }, {});
        var circulars = [];
        _.each(dByN, function (d, n1) {
          _.each(d, function (n2) {
            if (_.includes(dByN[n2], n1)) circulars.push(n1);
          });
        });
        throw new Error('Circular dependencies: "' + circulars.join('", "') + '"');
      } else {
        dependents = getDependents(culprits);
        throw new Error('Unresolveable dependenc' +
          (culprits.length === 1 ? 'y' : 'ies') +
          ': "' + culprits.join('", "') +
          '" for object' + (dependents.length === 1 ? '' : 's') +
          ' "' + dependents.join('", "') + '"'
        );
      }
    }
  };

  graph.register = function (name, dependencies, initializer) {
    queue.push([name, dependencies, initializer]);
    if (initialized) processQueue();
  };

  graph.require = _.partial(graph.register, false);

  graph.init = function (dependencies, bootstrap) {
    processQueue();
    initialized = true;
    if (_.isFunction(dependencies)) {
      bootstrap = dependencies;
      dependencies = [];
    }
    if (bootstrap) graph.require(dependencies, bootstrap);
  };

  return graph;

})(_);
