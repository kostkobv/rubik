import requests from './services/requests';

const FIRST_PAGE_INDEX = 0;

/**
 * Search module prototype
 * @param {Object} config - config for instance that should be created
 * @constructor
 */
function SearchModule(config) {
  this.config = config;
  this.articles = [];
  this.page = 0;
}

/**
 * Fetches the articles
 * @returns {Promise} - result of get articles
 */
SearchModule.prototype.fetch = function (params) {
  return requests()
    .get(this.config.get.endpoint, params || this.config.get.params)
    .then(res => this.parseArticles(res));
};

/**
 * Parses raw response from API with articles
 * @param {Object} res - response from API with articles
 * @returns {Array} - articles
 */
SearchModule.prototype.parseArticles = function (res) {
  this.articles = res.body.articles;
  this.pagesCount = Math.ceil(this.articles.length / this.config.articlesPerPage);

  return this.articles;
};

/**
 * Returns count of articles in stack
 * @returns {Number} - count of articles in stack
 */
SearchModule.prototype.getArticlesCount = function () {
  if (!this.articles) {
    return 0;
  }

  return this.articles.length;
};

/**
 * Returns the start and end indexes for stack slice.
 * If page number is less than 0 it will return indexes for first page
 *
 * @param {Number} pageNumber - desired page number
 * @param {Number} articlesPerPage - articles per page
 * @returns {[{Number}, {Number}]} - start and end index for slicing the stack
 * to get content for desired page
 */
function getPageIndex(pageNumber, articlesPerPage) {
  let nextPageNumber = pageNumber;

  if (pageNumber < FIRST_PAGE_INDEX) {
    nextPageNumber = FIRST_PAGE_INDEX;
  }

  const startIndex = nextPageNumber * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;

  return [
    startIndex,
    endIndex
  ];
}

/**
 * Returns the stack with recently fetched articles
 * @param {Number} pageNumber - page for which articles should be returned
 * @returns {Array} - articles
 */
SearchModule.prototype.getArticles = function (pageNumber = 0) {
  const indexes = getPageIndex(pageNumber, this.config.articlesPerPage);
  const nextPageArticles = this.articles.slice(...indexes);

  if (nextPageArticles.length) {
    // update the actual page number
    this.page = pageNumber;
  }

  // we can't go lower than first page
  if (pageNumber < FIRST_PAGE_INDEX) {
    this.page = FIRST_PAGE_INDEX;
  }

  return nextPageArticles;
};

/**
 * Automatically goes to the next page
 *
 * @returns {Array} - next page articles
 */
SearchModule.prototype.nextPage = function () {
  const nextPageNumber = this.page + 1;

  return this.getArticles(nextPageNumber);
};

/**
 * Automatically goes to the previous page.
 * If no previous page returns articles for first page
 *
 * @returns {Array} - previous page articles
 */
SearchModule.prototype.previousPage = function () {
  const previousPageNumber = this.page - 1;

  return this.getArticles(previousPageNumber);
};

export default function init(config) {
  return new SearchModule(config);
}
