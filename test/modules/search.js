import expect, { nock } from '../requires';
import search from '../../src/modules/search';
import config from '../config/modules/search.json';
import articlesMock from '../mocks/articles.json';
import requestConfigs from '../config/modules/services/requests.json';
import request from '../../src/modules/services/requests';

describe('search module', () => {
  let searchInstance;

  before(() => {
    request(requestConfigs);
    searchInstance = search(config);
  });

  it('should create new instance each time', () => {
    const testConfig = { test: 'test' };
    const newSearchInstance = search(testConfig);

    expect(searchInstance).not.contain(testConfig);
    return expect(newSearchInstance).not.eql(searchInstance).and.contain(testConfig);
  });

  it('should be able to retrieve all articles', () => {
    nock
      .get(config.get.endpoint)
      .query(config.get.params)
      .reply(200, articlesMock);

    return searchInstance.get().then(articles => expect(articles.length).to.equal(9));
  });
});
