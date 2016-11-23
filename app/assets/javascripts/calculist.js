var window = this;
window.sessionStorage || (window.sessionStorage = {});
(function (global, _) {

  'use strict';

  var calculist = {};

  var registeredObjects = {},
      require = _.propertyOf(registeredObjects),
      queue = [],
      initialized = false;

  var processQueue = function () {
    var _process = _.spread(function (name, dependencies, initializer) {
      var resolvedDependencies = _.compact(_.map(dependencies, require));
      if (resolvedDependencies.length < dependencies.length) {
        return false;
      } else if (name) {
        if (registeredObjects[name]) throw new Error('Naming collision for "' + name + '"');
        registeredObjects[name] = initializer.apply(null, resolvedDependencies);
        if (!registeredObjects[name]) throw new Error('Attempted to register a falsy value for "' + name + '"');
        return true;
      } else {
        initializer.apply(null, resolvedDependencies);
        return true;
      }
    });
    var removed = [1];
    while (removed.length > 0) {
      removed = _.remove(queue, _process);
    }
    if (queue.length) {
      var notFound = _.uniq(_.reject(_.flatten(_.map(queue, '1')), require));
      var getDependents = function (dependencies) {
        return _.map(_.filter(queue, _.spread(function (name, _dependencies) {
          return _.intersection(dependencies, _dependencies).length > 0;
        })), _.spread(function (name) { return name || '[require]'; }));
      };
      var dependents = getDependents(notFound);
      var culprits = _.difference(notFound, dependents);
      if (culprits.length === 0) {
        var dByN = _.reduce(queue, function (h, s) {
          if (require(s[0])) return h;
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

  calculist.register = function (name, dependencies, initializer) {
    queue.push([name, dependencies, initializer]);
    if (initialized) processQueue();
  };

  calculist.require = _.partial(calculist.register, false);

  calculist.init = function (dependencies, bootstrap) {
    processQueue();
    initialized = true;
    if (_.isFunction(dependencies)) {
      bootstrap = dependencies;
      dependencies = [];
    }
    if (bootstrap) calculist.require(dependencies, bootstrap);
  };

  global.calculist = calculist;

})(this, _);
