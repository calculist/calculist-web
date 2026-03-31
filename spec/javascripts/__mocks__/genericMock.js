// Generic mock that works for both function-style and object-style services.
// Must be callable since some services (computationIsPaused, somethingHasChanged, etc.)
// are imported as functions.
var noop = function() { return false; };
var mock = function() { return false; };
mock.get = noop;
mock.set = noop;
mock.on = noop;
mock.off = noop;
mock.trigger = noop;
mock.show = noop;
mock.hide = noop;
mock.save = noop;
mock.saving = noop;
mock.saved = noop;
mock.add = noop;
mock.parse = function(s) { return s; };
mock.parseSlashElements = function(s) { return s; };
mock.findUrls = function(s) { return s; };
mock.isUrl = function() { return false; };
mock.isDesktop = false;
mock.isMobileDevice = false;
mock.is = function() { return false; };
mock.isEditing = function() { return false; };
mock.isInPage = function() { return true; };
module.exports = mock;
module.exports.default = mock;
module.exports.__esModule = true;
