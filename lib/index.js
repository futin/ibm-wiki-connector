'use strict';
// core modules

// 3rd party modules

// internal modules
const ibmConnectionsWikiConnector = require('./connector');

/**
 * receive configuration from the data source settings and initialize the connector instance
 *
 * @param {DataSource} dataSource           The data source instance
 * @param {Function} callback               Called with `(err, connector)`. The connector instance passed
 *                                          to this callback has had `.connect()` called on it, which means
 *                                          it is fully operational and ready to go.
 * @example
 *
 * const ibmConnectionsWikiConnector = require('gravity-connector-wiki');
 *
 * // The connector returned by initialize() is not ready for operation yet.
 * const connector = ibmConnectionsWikiConnector.initialize(yourDataSource, (err, connector) => {
 *   // The connector passed to the callback is ready for use.
 * });
 */
function initializeConnector(dataSource, callback) {
  const settings = dataSource.settings;
  const connector = ibmConnectionsWikiConnector(settings, dataSource);

  // assign connector instance to dataSource. Although this doesn't comply with the concept of `pure functions`, it is required by loopback's connector contract
  // https://docs.strongloop.com/display/public/LB/Building+a+connector#Buildingaconnector-Implementlifecylemethods
  Object.assign(dataSource, { connector });

  if (callback) {
    if (settings.lazyConnect) {
      return callback();
    }
  }
  return connector.connect(callback);
}

exports.initialize = function initialize(dataSource, callback) {
  // run initializeConnector if pre-requisites are met
  if (typeof callback === 'function') {
    return initializeConnector(dataSource, callback);
  }

  const err = new Error('Initialize function needs callback function to work properly.');

  return callback(err);
};
