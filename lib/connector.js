'use strict';
// core modules

// 3rd party modules
const _ = require('lodash');
const Connector = require('loopback-connector').Connector;
const IbmConnectionsWikisService = require('ibm-connections-wikis-service');
// const attachCredentialsPlugin = require('oniyi-http-plugin-credentials');

// internal modules
const loggerFactory = require('./logger-factory');
const MethodNotSupportedError = require('./errors/MethodNotSupportedError');

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
    const { wikiLabel, pageLabel, versionLabel, retrieveWikiId } = options;
    if (retrieveWikiId) {
      service.getWikisFeed(options)
        .then(wiki => callback(null, [wiki[0]]))
        .catch(err => callback(err));
    } else if (versionLabel) { // eslint-disable-line

    } else if (pageLabel) {
      let wikiPage = {};
      service.getPageEntry(options)
        .then((page) => {
          wikiPage = _.assign(page, {});
          service.getPageMedia(options, page)
            .then((media) => {
              wikiPage.content = media;
              service.getPageArtifacts(options)
                .then((comments) => {
                  wikiPage.comments = comments;
                  return callback(null, [wikiPage]);
                })
                .catch(err => callback(err));
            })
            .catch(err => callback(err));
        })
        .catch(err => callback(err));
    } else if (wikiLabel) {
      service.getPagesFeed(options)
        .then((result) => {
          const data = _.assign(filter, { entries: result });
          return callback(null, [data]);
        })
        .catch(err => callback(err));
    } else {
      return callback(new Error('Wrong request'));
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
