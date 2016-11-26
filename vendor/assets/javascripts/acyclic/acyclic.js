(function (global, _) {

  'use strict';

  var acyclic = {};

  acyclic.new = function () {

    var graph = {};

    var vertices = {},
        getVertex = _.propertyOf(vertices),
        queue = [],
        initialized = false;

    var throwError = function () {
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
          h[s[0]] = _.reject(s[1], getVertex);
          return h;
        }, {});
        var followPath = function (paths, n) {
          if (paths.length > 1 && paths[0] === _.last(paths)) {
            throw new Error('Circular dependencies: "' + paths.join('" -> "') + '"');
          }
          _.each(dByN[n], function (d) {
            paths.unshift(d);
            followPath(paths, d);
            paths.shift();
          });
        };
        var paths = [];
        _.each(_.keys(dByN), function (n) {
          paths.unshift(n);
          followPath(paths, n);
          paths.shift();
        });
      } else {
        dependents = getDependents(culprits);
        throw new Error('Unresolveable dependenc' +
          (culprits.length === 1 ? 'y' : 'ies') +
          ': "' + culprits.join('", "') +
          '" for object' + (dependents.length === 1 ? '' : 's') +
          ' "' + dependents.join('", "') + '"'
        );
      }
    };

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
      if (queue.length) throwError();
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
  };

  try {
    module.exports = acyclic;
  } catch (e) {
    global.acyclic = acyclic;
  }

})(this, _);
