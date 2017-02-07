'use strict';
// core modules
const util = require('util');

// 3rd party modules

// internal modules

function MethodNotSupportedError(methodName) {
  Error.call(this);
  // captureStackTrace is V8-only (node, chrome)
  Error.captureStackTrace(this, MethodNotSupportedError);

  this.name = 'MethodNotSupportedError';
  this.message = `method "${methodName}" is not supported on this object`;
}

util.inherits(MethodNotSupportedError, Error);

module.exports = MethodNotSupportedError;
