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

  beforeEach(() =>
    nock
      .get(config.get.endpoint)
      .query(config.get.params)
      .reply(200, articlesMock)
  );

  it('should create new instance each time', () => {
    const testConfig = { test: 'test' };
    const newSearchInstance = search(testConfig);

    expect(searchInstance).not.contain(testConfig);
    return expect(newSearchInstance).not.eql(searchInstance).and.contain(testConfig);
  });

  it('should be able to retrieve all articles', () =>
    searchInstance.fetch().then(articles => expect(articles.length).to.equal(9))
  );

  it('should keep all of the articles in stack', () =>
    searchInstance.fetch().then(() =>
      expect(searchInstance.articles.length).to.equal(9)
    )
  );

  describe('pagination', () => {
    it('should be able of return the articles by pages', () => {
      searchInstance.fetch().then(() =>
        expect(searchInstance.getArticles(1).length).to.equal(4)
      );
    });

    it('should be able to go to the next page', () => {
      searchInstance.fetch().then(() => {
        searchInstance.getArticles(0);

        return expect(searchInstance.nextPage().length).to.equal(4);
      });
    });

    it('should be able to go to the next page and update the actual page number', () => {
      searchInstance.fetch().then(() => {
        searchInstance.getArticles(0);
        searchInstance.nextPage();

        return expect(searchInstance.page).to.equal(1);
      });
    });

    it('should return empty array if there is no next page', () => {
      searchInstance.fetch().then(() => {
        searchInstance.getArticles(1);

        return expect(searchInstance.nextPage()).to.be.empty;
      });
    });

    it('should not increment page number if there is no next page', () => {
      searchInstance.fetch().then(() => {
        searchInstance.getArticles(1);

        const pageNumber = searchInstance.page;

        searchInstance.nextPage();

        return expect(searchInstance.page).to.be.equal(pageNumber);
      });
    });

    it('should be able to go to the previous page', () => {
      searchInstance.fetch().then(() => {
        searchInstance.getArticles(1);

        return expect(searchInstance.previousPage().length).to.be.equal(5);
      });
    });

    it('should decrement page number if there is previous page', () => {
      searchInstance.fetch().then(() => {
        const pageNumber = searchInstance.page;

        searchInstance.getArticles(pageNumber + 1);
        searchInstance.previousPage();

        return expect(searchInstance.page).to.be.equal(pageNumber);
      });
    });

    it('should return first page if there is no previous page', () => {
      searchInstance.fetch().then(() => {
        searchInstance.getArticles();

        return expect(searchInstance.previousPage().length).to.be.equal(5);
      });
    });

    it('should not go to previous page if it is on a first page', () => {
      searchInstance.fetch().then(() => {
        const pageNumber = searchInstance.page;
        searchInstance.getArticles();

        searchInstance.previousPage();

        return expect(searchInstance.page).to.be.equal(pageNumber);
      });
    });
  });
});
