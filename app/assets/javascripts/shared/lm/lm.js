var window = this;
window.sessionStorage || (window.sessionStorage = {});
(function (global, _) {

  'use strict';

  var lm = {};

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
      var notFound = _.reject(_.flatten(_.map(queue, '1')), require);
      throw new Error('Unresolveable dependencies: "' + notFound.join('", "') + '"');
    }
  };

  lm.register = function (name, dependencies, initializer) {
    queue.push([name, dependencies, initializer]);
    if (initialized) processQueue();
  };

  lm.require = _.partial(lm.register, false);

  lm.init = function (dependencies, bootstrap) {
    processQueue();
    initialized = true;
    if (_.isFunction(dependencies)) {
      bootstrap = dependencies;
      dependencies = [];
    }
    if (bootstrap) lm.require(dependencies, bootstrap);
  };

  global.lm = lm;

})(this, _);
