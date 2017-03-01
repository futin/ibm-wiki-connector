'use strict';

import { test } from 'ava';
import sinon from 'sinon';
import _ from 'lodash';

// stubs, spies & mocks
import { Connector } from 'loopback-connector';
import { DataSource } from 'loopback-datasource-juggler';
import { initialize } from '../lib';

let mySourceSettings;
let fooConnector;
let fooSource;

test.before(() => {
  mySourceSettings = {
    baseUrl: 'https://apps.na.collabserv.com',
  };
  // fooConnector, vanilla Connector
  fooConnector = new Connector({ initialize: sinon.spy() });
  // fooSource datasource with vanilla fooConnector
  fooSource = new DataSource({ connector: fooConnector }, mySourceSettings);
  // barSource datasource with barConnector
});

test('checks when initialized with callback as function', (t) => {
  const callback = sinon.spy();
  initialize(fooSource, callback);
  t.false(callback.called, 'callback should not have been called');
});

test('checks initialization with callback as function and lazyConnect', (t) => {
  fooSource = new DataSource({ connector: fooConnector }, _.merge(mySourceSettings, { lazyConnect: true }));
  const callback = sinon.spy();
  initialize(fooSource, callback);
  t.true(callback.called, 'callback should have been called immediately, since lazy connect is on');
});

test('checks initialization with wrong callback type', (t) => {
  const error = t.throws(() => {
    initialize(fooSource, {});
  }, TypeError);
  t.is(error.message, 'Initialize function needs callback function in order to init connector.');
});
