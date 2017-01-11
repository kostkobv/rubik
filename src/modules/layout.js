import objectMerge from 'lodash/merge';
import requests from './services/requests';

/**
 * Layout module prototype
 * @param {Object} config - config for instance that should be created
 * @constructor
 */
function LayoutModule(config) {
  this.config = config;
  this.parseArticles(config.articles);
}

/**
 * Fetches the data from API
 *
 * @returns {Promise} - returns parsed articles
 */
LayoutModule.prototype.fetch = function () {
  return requests().get(this.config.get.endpoint, this.config.get.params)
    .then(articles => this.parseArticles(articles.body));
};

/**
 * Parses object with articles into an array that will be used later as stack
 *
 * @param {Object} articles - raw articles
 * @returns {Array} - parsed articles
 */
LayoutModule.prototype.parseArticles = function (articles) {
  if (!articles) {
    this.stack = [];
    return this.stack;
  }

  const stack = [];

  Object.keys(articles).forEach((index) => {
    const parsedIndex = parseInt(index, 10);

    if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
      stack[parsedIndex] = articles[parsedIndex];
    }
  });

  this.stack = stack;

  return this.stack;
};

/**
 * Returns the article from stack by index
 * @param {Number} index - index of item that should be returned
 * @returns {?Object} - article
 */
LayoutModule.prototype.getArticle = function (index) {
  const item = this.stack[index];

  if (!item) {
    return null;
  }

  return item;
};

/**
 * Pushes article into stack. Shifts all the articles that are coming after
 * the slot if slot was not empty. Just places the article into the slot
 * if slot previously was empty
 *
 * @param {Number} index - index into which article should be pushed
 * @param {Object} article - article should be pushed there
 * @returns {boolean} - status of the push
 */
LayoutModule.prototype.pushArticle = function (index, article) {
  if (!this.stack[index]) {
    this.stack[index] = article;

    return true;
  }

  this.stack.splice(index, 0, article);

  return true;
};

/**
 * Allows to edit the article in the stack.
 * Basically just merges the content of the passed article into the article's content
 * that is already in stack
 *
 * @param {Number} index - index of article that should be edited
 * @param {Object} article - article
 * @returns {boolean} - status of the edit
 */
LayoutModule.prototype.editArticle = function (index, article) {
  if (!this.stack[index] || !article || !article.content) {
    return false;
  }

  this.stack[index].content = objectMerge(this.stack[index].content, article.content);

  return true;
};

/**
 * Removes article from the stack.
 * Will not remove the article if there is no stack or index is unknown
 *
 * @param {Number} index - index of article in stack that should be removed
 * @returns {boolean} - status of removing the item
 */
LayoutModule.prototype.removeArticle = function (index) {
  if (!this.stack || !this.stack.length || !Number.isInteger(index) || !this.stack[index]) {
    return false;
  }

  delete this.stack[index];
  return true;
};

export default function init(config) {
  return new LayoutModule(config);
}
