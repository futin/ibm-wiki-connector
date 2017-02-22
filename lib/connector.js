'use strict';
// core modules

// 3rd party modules
const _ = require('lodash');
const Connector = require('loopback-connector').Connector;
const IbmConnectionsWikisService = require('ibm-connections-wikis-service');
const attachCredentialsPlugin = require('oniyi-http-plugin-credentials');
const Promise = require('bluebird');

// internal modules
const loggerFactory = require('./logger-factory');
const MethodNotSupportedError = require('./errors/MethodNotSupportedError');
const { parseData, collectPromises } = require('./utils/helper');

/**
 * Gravity Connector IBM Connections Wiki, uses gravity-connections-wikis-service to retrieve data
 * from IBM Connections Cloud
 *
 * @param {Object} settings      Settings provided by datasource, need for setting up our wiki service
 * @param {Object} dataSource    Entity that is used as main bridge between WikiConfig model and wiki connector
 * @returns {*}
 */
function wikiConnector(settings, dataSource) {
  const connector = new Connector('wiki', settings);
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

    if (settings.plugins && settings.plugins.credentials) {
      service.useHttpClientPlugin(attachCredentialsPlugin(settings.plugins.credentials));
    }
    logger.debug('> connect');

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

  function all(model, filter, options, callback) { // eslint-disable-line consistent-return
    logger.debug('> all; model %s, filter %j, options %j', model, filter, options);
    const { wikiLabel, pageLabel, versionLabel } = options;
    // perform checks depening on what options are provided. Possible options are:
    // 1. wikiLabel, pageLabel and versionLabel ->
    // wikis/authPath/api/wiki/:options.wikiLabel/page/:options.pageLabel/version/:options.versionLabel
    // we check only versionLabel over here, because versionLabel can't be sent without wikiLabel and pageLabel,
    // so if we have versionLabel, we must have these 2 as well
    if (versionLabel) {
      const promises = [];
      promises.push(service.getPageVersion(options));
      promises.push(service.getVersionMedia(options));
      // if (filter.showComments) {
      //   promises.push(service.getPageArtifacts(options));
      // }
      // if (filter.showVersions) {
      //   const versionOptions = _.assign({ category: 'version' }, options);
      //   promises.push(service.getPageArtifacts(versionOptions));
      // }
      Promise.all(promises)
        .then((data) => {
          const result = parseData(data);
          return callback(null, result);
        })
        .catch(err => callback(err));

      // 2. wikiLabel and pageLabel -> wikis/authPath/api/wiki/:options.wikiLabel/page/:options.pageLabel
      // we check only pageLabel over here, because pageLabel can't be sent without wikiLabel,
      // and if wikiLabel is alone, we got that covered
    } else if (pageLabel) {
      Promise.all(collectPromises(service, options, filter))
        .then((data) => {
          const result = parseData(data);
          return callback(null, result);
        })
        .catch(err => callback(err));

      // 3. wikiLabel alone -> wikis/authPath/api/wiki/${options.wikiLabel}/feed
    } else if (wikiLabel) {
      service.getPagesFeed(options)
        .then((result) => {
          const data = _.assign(filter, result);
          return callback(null, data);
        })
        .catch(err => callback(err));
    } else {
      return callback(new Error('Wrong request. Make sure you have the right parameters'));
    }
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
