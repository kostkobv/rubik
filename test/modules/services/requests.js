import nock from 'nock';

import expect from '../../requires';
import requests from '../../../src/modules/services/requests';
import config from '../../config/modules/services/requests.json';

describe('requests service', () => {
  let request;

  before(() => {
    request = requests(config);
    nock(config.domain)
      .get('/test')
      .reply(200, true);
  });

  it('should not init itself twice', () => {
    const testDomain = 'test';
    const testConfig = Object.assign({}, config, { domain: testDomain });
    const testRequest = requests(testConfig);

    return expect(testRequest.config.domain).equal(config.domain).and.equal(request.config.domain);
  });

  it('should do GET requests without params if none passed', () =>
    expect(Promise.resolve({ foo: 'bar' })).to.eventually.have.property('foo')
  );
});
