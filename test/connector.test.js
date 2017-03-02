'use strict';
// core modules

// 3rd party modules
import _ from 'lodash';
import { test } from 'ava';
import { DataSource } from 'loopback-datasource-juggler';

// internal modules
const ibmConnectionsWikiConnector = require('../lib/connector');

// configure dotenv
require('dotenv').config();

let mySourceSettings;
let mockDataSource;
let connector;
const params = {
  options: {},
  filter: {},
  model: '',
};
const userCredentials = process.env.USER_CREDENTIALS;

test.before(() => {
  mySourceSettings = {
    baseUrl: 'https://apps.na.collabserv.com',
    lazyConnect: true,
    headers: {
      Authorization: `Basic ${new Buffer(userCredentials).toString('base64')}`,
    },
  };
  // fooSource datasource with vanilla fooConnector
  mockDataSource = new DataSource(mySourceSettings);
  const { settings } = mockDataSource;
  // init wiki connector with mocked settings and dataSource
  connector = ibmConnectionsWikiConnector(settings, mockDataSource);
  // set default params for connector.all function
  params.options = {
    wikiLabel: '434a24f4-28a2-45a4-b83a-a55120f1ca72',
  };
  params.filter = {
    title: 'test wiki config',
    id: 'asdqwe123',
    showComments: true,
    showVersions: true,
    showLinkOpenSource: true,
  };
  params.model = 'wikiMockModel';
});

test.cb('makes sure that function "connect" is working properly', (t) => {
  t.plan(1);
  connector.connect((err, result) => {
    t.is(result, connector, 'result from connector.connect should be equal to init connector');
    t.end();
  });
});

test.cb('checks function "all": wikiLabel provided, all filters provided', (t) => {
  const { model, filter, options } = params;
  connector.all(model, filter, options, (err, result) => {
    ['id', 'title', 'showComments', 'showVersions', 'showLinkOpenSource', 'entries'].forEach((elem) => {
      t.true(elem in result, `${elem} should be a member of result`);
      if (_.isBoolean(result[elem])) {
        t.is(result[elem], params.filter[elem], `${elem} should be equal to ${params.filter[elem]}`);
      }
    });
    // make sure we have an array of entries, unique ID and title
    const { entries, id, title } = result;
    t.true(_.isArray(entries), 'entries should be an array');
    t.true(entries.length >= 1, 'need to have at least 1 entry');
    entries.forEach((entry) => {
      ['id', 'title'].forEach((prop) => {
        t.true(prop in entry, `${prop} should be a member of entry`);
      });
    });
    t.is(id, params.filter.id, `${id} should be equal to ${params.filter.id}`);
    t.is(title, params.filter.title, `${title} should be equal to ${params.filter.title}`);
    t.end();
  });
});

test.cb('checks function "all": wikiLabel not provided', (t) => {
  const { model, filter } = params;
  connector.all(model, filter, {}, (err) => {
    t.is(err.message, 'Wrong request. Make sure you have the right parameters');
    t.end();
  });
});

test.cb('checks function "all": wrong wikiLabel is provided', (t) => {
  const { model, filter } = params;
  const options = { wikiLabel: 'this is so wrong' };
  connector.all(model, filter, options, (err) => {
    t.is(err.message, 'Not Found');
    t.is(err.httpStatus, 404);
    t.end();
  });
});

test.cb('checks function "all": wikiLabel and pageLabel provided, all filters provided', (t) => {
  const { model, filter, options } = params;
  const modifiedOptions = _.merge(options, { pageLabel: '1e9db28a-5030-4181-b621-599236c0e437' });
  connector.all(model, filter, modifiedOptions, (err, result) => {
    const pageProperties = ['id', 'title', 'content', 'link', 'author', 'updatedAt', 'comments', 'versions'];
    pageProperties.forEach((prop) => {
      t.true(prop in result, `${prop} should be a member of result`);
    });
    t.true(_.isArray(result.versions), 'versions should be an array');
    t.true(_.isArray(result.comments), 'comments should be an array');
    // since we are getting single wiki page instance, id of that page is equal to pageLabel we send as request
    t.is(result.id, modifiedOptions.pageLabel, `${result.id} should be equal ${modifiedOptions.pageLabel}`);
    t.end();
  });
});

test.cb('checks function "all": wikiLabel and wrong pageLabel provided, all filters provided', (t) => {
  const { model, filter, options } = params;
  const modifiedOptions = _.merge(options, { pageLabel: 'this is so wrong' });
  connector.all(model, filter, modifiedOptions, (err) => {
    t.is(err.message, 'Not Found');
    t.is(err.httpStatus, 404);
    t.end();
  });
});

test.cb('checks function "all": all labels provided, all filters provided', (t) => {
  const { model, filter, options } = params;
  const modifedOptions = _.merge(options, {
    pageLabel: '1e9db28a-5030-4181-b621-599236c0e437',
    versionLabel: '76f4fca7-2ac5-4166-a8b2-e0ccbb271052',
  });
  connector.all(model, filter, modifedOptions, (err, result) => {
    const pageProperties = ['id', 'title', 'content', 'link', 'author', 'updatedAt'];
    pageProperties.forEach((prop) => {
      t.true(prop in result, `${prop} should be a member of result`);
    });
    t.end();
  });
});

test.cb('checks function "all": wikiLabel, pageLabel and wrong VersionLabel provided, all filters provided',
  (t) => {
    const { model, filter, options } = params;
    const modifedOptions = _.merge(options, {
      pageLabel: '1e9db28a-5030-4181-b621-599236c0e437',
      versionLabel: 'this is so wrong',
    });
    connector.all(model, filter, modifedOptions, (err) => {
      t.is(err.message, 'Not Found');
      t.is(err.httpStatus, 404);
      t.end();
    });
  });

test.cb('checks function "create": all data provided', (t) => {
  connector.create('wiki', {}, {}, (err) => {
    t.is(err.name, 'MethodNotSupportedError');
    t.is(err.message, 'method "create" is not supported on this object');
    t.end();
  });
});

