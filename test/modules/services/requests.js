import expect, { nock } from '../../requires';
import requests from '../../../src/modules/services/requests';
import config from '../../config/modules/services/requests.json';

describe('requests service', () => {
  let request;

  before(() => {
    request = requests(config);
  });

  it('should not init itself twice', () => {
    const testDomain = 'test';
    const testConfig = Object.assign({}, config, { domain: testDomain });
    const testRequest = requests(testConfig);

    return expect(testRequest.config.domain).equal(config.domain).and.equal(request.config.domain);
  });

  it('should do GET requests without params if none passed', () => {
    const response = {
      data: 'ok'
    };
    const endpoint = '/test';

    // mock API response
    nock
      .get(endpoint)
      .reply(200, response);

    return request.get(endpoint)
      .then(res => expect(res.body).to.eql(response));
  });
});
