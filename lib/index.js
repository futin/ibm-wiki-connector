'use strict';
// core modules

// 3rd party modules
const _ = require('lodash');
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
function initialize(dataSource, callback) {
  const settings = dataSource.settings;

  const connector = ibmConnectionsWikiConnector(settings, dataSource);
  Object.assign(dataSource, { connector });

  if (_.isFunction(callback)) {
    connector.connect(callback);
  }

  const err = new Error([
    'This connector can not be used for regular datasources.',
    'Only aggregated datasources are supported for now.',
  ].join(' '));

  return callback(err);
}

module.exports = initialize;
