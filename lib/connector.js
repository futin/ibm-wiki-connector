'use strict';
// core modules

// 3rd party modules
const _ = require('lodash');
const Connector = require('loopback-connector').Connector;
const IbmConnectionsWikisService = require('ibm-connections-wikis-service');
const attachCredentialsPlugin = require('oniyi-http-plugin-credentials');

// internal modules
const loggerFactory = require('./logger-factory');
const MethodNotSupportedError = require('./errors/MethodNotSupportedError');

function wikiConnector(settings, dataSource) {
  const connector = new Connector('gravity-ibm-connections-wiki', settings);
  const logger = loggerFactory(settings.name);

  logger.debug(`Settings: ${settings}`);

  // create reference for our future service instance
  let service;

  _.assign(connector, {
    buildNearFilter: false,
    dataSource,
  });

  // Lifecycle Handlers

  /**
   *  create connections to the backend system
   */
  function connect(callback) {
    service = new IbmConnectionsWikisService(settings.baseUrl, settings);

    return callback(null, connector);
  }

  function disconnect(callback) {
    logger.debug('> disconnect');
    return callback();
  }

  function ping(callback) {
    logger.debug('> ping');
    return callback();
  }

  _.assign(connector, {
    connect,
    disconnect,
    ping,
  });

  function create(model, data, options, callback) {
    logger.debug('> create; model %s, data %j, options %j', model, data, options);
    return callback(new MethodNotSupportedError('create'));
  }

  function updateOrCreate(model, data, options, callback) {
    logger.debug('> updateOrCreate; model %s, data %j, options %j', model, data, options);
    return callback(new MethodNotSupportedError('updateOrCreate'));
  }

  function findOrCreate(model, data, options, callback) {
    logger.debug('> findOrCreate; model %s, data %j, options %j', model, data, options);
    return callback(new MethodNotSupportedError('findOrCreate'));
  }

  function all(model, filter, options, callback) {
    logger.debug('> all; model %s, filter %j, options %j', model, filter, options);
    // options.user.credentials({
    //     where: {
    //       provider: settings.plugins.credentials.providerName,
    //     },
    //   },
    //   (credentialsErr, results) => {
    //     if (credentialsErr) {
    //       return callback(credentialsErr);
    //     }
    //
    //     const ibmConnectionsProfile = results[0].profile;
    //     // eslint-disable-next-line no-param-reassign
    //     filter = _.defaults(filter, {
    //       assignedToUserid: ibmConnectionsProfile.userid,
    //       // If we provide assignedToUserid, we don't need to pass inculdeunassigned.
    //       // It is left here commented out for documentation purposes.
    //       // For example, if you don't care exactly who the todos are assigned to,
    //       // but want to make sure you only get back assigned todos, then you can
    //       // comment out assignedToUserid and uncomment includeassigned.
    //       // includeunassigned: 'no',
    //     });
    //
    //     const params = _.merge({}, options, {
    //       query: filter,
    //     });

    console.log('model', model);
    console.log('filter', filter);
    console.log('options', options);

    return callback(null, { model, filter, options });
  }

  function count(model, where, options, callback) {
    logger.debug('> count; model %s, where %j, options %j', model, where, options);
    return callback(new MethodNotSupportedError('count'));
  }

  // removeAll, deleteAll, destroyAll
  function destroyAll(model, where, options, callback) {
    logger.debug('> destroyAll; model %s, where %j, options %j', model, where, options);
    return callback(new MethodNotSupportedError('destroyAll'));
  }

  function save(model, id, options, callback) {
    logger.debug('> save; model %s, id %s, options %j', model, id, options);
    return callback(new MethodNotSupportedError('save'));
  }

  function update(model, where, data, options, callback) {
    logger.debug('> update; model %s, where %j, data %j, options %j', model, where, data, options);
    return callback(new MethodNotSupportedError('update'));
  }


  function destroy(model, id, options, callback) {
    logger.debug('> destroy; model %s, id %s options %j', model, id, options);
    return callback(new MethodNotSupportedError('destroy'));
  }

  function updateAttributes(model, id, data, options, callback) {
    logger.debug('> updateAttributes; model %s, id %s, data %j, options %j', model, id, data, options);
    return callback(new MethodNotSupportedError('updateAttributes'));
  }

  // make Model method delegation functions member of the connector object
  _.assign(connector, {
    create,
    updateOrCreate,
    findOrCreate,
    all,
    destroyAll,
    count,
    save,
    update,
    destroy,
    updateAttributes,
  });

  return connector;
}

module.exports = wikiConnector;
