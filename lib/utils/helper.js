'use strict';
// core modules

// 3rd party modules
const _ = require('lodash');

// internal modules

// Promise.all returns result as an array of data in the same order that we've sent promises
/**
 *  Promise.all returns result as an array of data in the same order that we've sent promises
 * @param {Array} data    Array of data that need to be parsed
 * @returns {Object}      Parsed data that is going to be sent to loopback model through callback
 */
function parseData(data) {
  let result = {};
  // transform an array to an object
  const reducedData = data.reduce((res, element) => _.assign(element, res));
  // grab only data we actually need, and assign in to result object
  // if some properties are undefined, that means that we do not need them (as stated in wiki config model)
  const { wikiPage, wikiPageVersion, media, comments, versions } = reducedData;
  if (wikiPage) {
    wikiPage.content = media;
    result = _.assign(wikiPage, {});
  } else if (wikiPageVersion) {
    wikiPageVersion.content = media;
    result = _.assign(wikiPageVersion, {});
  }
  if (comments) {
    result = _.assign(result, { comments });
  }
  if (versions) {
    result = _.assign(result, { versions });
  }
  return result;
}

/**
 *  Used for collecting promises that are going to be used for retrieving wiki page
 *
 * @param {Object} service    WikiService instance that we use to communicate with API
 * @param {Object} options    Entity that holds information on different parameters need by API
 * @param {Object} filter     Entity that holds information about wiki configuration
 * @returns {Array}           Array of promises that needs to be loaded
 */
function collectPromises(service, options, filter) {
  const promises = [];
  promises.push(service.getPageEntry(options));
  promises.push(service.getPageMedia(options));
  if (filter.showComments) {
    promises.push(service.getPageArtifacts(options));
  }
  if (filter.showVersions) {
    const versionOptions = _.merge({ query: { category: 'version' } }, options);
    promises.push(service.getPageArtifacts(versionOptions));
  }
  return promises;
}

module.exports = {
  parseData,
  collectPromises,
};