(function (global, _) {

  'use strict';

  var acyclic = {};

  acyclic.new = function () {

    var graph = {};

    var vertices = {},
        namespaces = {},
        queue = [],
        initialized = false;

    var namespaceIsComplete = function (namespace, vertext) {
      return _.every(_.keys(namespace), function (key) {
        if (namespace[key]) return namespaceIsComplete(namespace[key], vertext[key]);
        return vertext[key];
      });
    };

    var getVertex = function (name) {
      var vertex = _.get(vertices, name);
      var namespace = vertex && _.get(namespaces, name);
      if (!namespace || namespaceIsComplete(namespace, vertex)) return vertex;
    };

    var throwError = function () {
      var notFound = _.uniq(_.reject(_.flatten(_.map(queue, '1')), getVertex));
      var getDependents = function (dependencies) {
        return _.map(_.filter(queue, _.spread(function (name, _dependencies) {
          return _.intersection(dependencies, _dependencies).length > 0;
        })), _.spread(function (name) { return name || '[require]'; }));
      };
      var dependents = getDependents(notFound);
      var culprits = _.difference(notFound, dependents);
      if (culprits.length === 0 || _.every(culprits, function (culprit) { return _.get(namespaces, culprit); })) {
        var dByN = _.reduce(queue, function (h, s) {
          if (!s[0] || getVertex(s[0])) return h;
          _.set(h, s[0], _.reject(s[1], getVertex));
          return h;
        }, {});
        var paths = [];
        var followPath = function (n, i) {
          if (_.isArray(n)) {
            paths.unshift(paths[0] + '.' + i);
            _.each(n, followPath);
          } else {
            paths.unshift(n);
          }
          if (paths.length !== _.uniq(paths).length) {
            throw new Error('Circular dependencies: "' + paths.join('" -> "') + '"');
          }
          _.each(_.get(dByN, n), followPath);
          paths.shift();
        };
        _.each(_.keys(dByN), followPath);
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
          _.update(vertices, name, function (existingValue) {
            if (existingValue) {
              throw new Error('Name or namespace collision for "' + name + '"');
            } else {
              var vertex = initializer.apply(null, resolvedDependencies);
              if (!vertex) throw new Error('Attempted to register a falsy value for "' + name + '"');
              return vertex;
            }
          });
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
      if (name) _.each([namespaces, vertices], function (object) {
        // Claim namespaces before initialization
        _.update(object, name, _.identity);
      });
      queue.push([name, dependencies, initializer]);
      if (initialized) processQueue();
      return graph;
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
      return graph;
    };

    return graph;
  };

  try {
    module.exports = acyclic;
  } catch (e) {
    global.acyclic = acyclic;
  }

})(this, this._ || require('lodash'));
