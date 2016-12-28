import jsdom from 'mocha-jsdom';
import sinon from 'sinon';
import expect from '../requires';
import config from '../config/views/search.json';
import searchView from '../../src/views/search';
import articlesMock from '../mocks/articles.json';

describe('Search View', () => {
  let searchViewInstance;
  let sandbox;

  jsdom();

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    document.body.innerHTML = '<div data-search>' +
      '<form data-search-form>' +
      '<input value="test" name="search" type="text" />' +
      '<select name="author">' +
      '<option></option>' +
      '<option value="0" selected>0</option>' +
      '<option value="1">1</option>' +
      '</select>' +
      '<button type="submit"></button>' +
      '</form>' +
      '<div data-search-results-count></div>' +
      '<div data-search-results></div>' +
      '<div>' +
      '<div data-search-pagination-prev></div>' +
      '<div data-search-pagination></div>' +
      '<div data-search-pagination-next></div>' +
      '</div>' +
      '</div>';

    searchViewInstance = searchView(config);
  });

  it('should create new instance each time', () => {
    const testConfig = Object.assign({}, config, { test: 'test' });
    const newSearchView = searchView(testConfig);

    expect(searchViewInstance).not.contain(testConfig);
    return expect(newSearchView).not.eql(searchViewInstance).and.contain(testConfig);
  });

  describe('Input form', () => {
    it('should parse data from input form on submit', () => {
      sandbox.stub(searchViewInstance.model, 'fetch').returns(Promise.resolve({}));

      const button = document.querySelector('button[type="submit"]');
      button.click();

      expect(searchViewInstance.model.fetch.calledOnce).to.be.equal(true);
      return expect(searchViewInstance.model.fetch).have.been.calledWith({
        search: 'test',
        author: '0',
        action: 'sickfront_filter_posts'
      });
    });

    it('should submit the form on change of selects', () => {
      sandbox.stub(searchViewInstance.model, 'fetch').returns(Promise.resolve({}));

      const event = new window.Event('change');
      document.querySelector('option[value="1"]').selected = true;
      document.querySelector('select').dispatchEvent(event);

      expect(searchViewInstance.model.fetch.calledOnce).to.be.equal(true);
      return expect(searchViewInstance.model.fetch).have.been.calledWith({
        search: 'test',
        author: '1',
        action: 'sickfront_filter_posts'
      });
    });
  });

  describe('results', () => {
    it('should render the results to the appropriate container', () => {
      sandbox.stub(searchViewInstance.model, 'fetch').returns(Promise.resolve(articlesMock.articles));

      searchViewInstance.model.articles = articlesMock.articles;
      searchViewInstance.renderLayout(0);

      const results = searchViewInstance.searchResults;

      return expect(results.innerHTML.length).to.be.not.equal(0);
    });

    it('should show the article count', () => {
      sandbox.stub(searchViewInstance.model, 'fetch').returns(Promise.resolve(articlesMock.articles));

      const expectedArticlesCount = articlesMock.articles.length.toString();

      searchViewInstance.model.articles = articlesMock.articles;
      searchViewInstance.renderLayout(0);

      return expect(document.querySelector(config.selectors.results.count).innerHTML)
        .to.be.equal(expectedArticlesCount);
    });
  });

  describe('pagination', () => {
    it('should render the controls for available pages');
    it('should be able to go to previous page');
    it('should be able to go to next page');
    it('should make the current page number button active');
    it('should disable previous page button if on first page');
    it('should disable next page button if on last page');
  });
});
