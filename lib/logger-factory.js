'use strict';

const oniyiLogger = require('oniyi-logger');

// create a logger instance and export it
module.exports = function makeLogger(label, settings) {
  const loggerLabel = label || 'anonymous';
  return oniyiLogger(`gravity:connector:wiki:${loggerLabel}`, settings);
};
