import requests from './services/requests';

/**
 * Search module prototype
 * @param {Object} config - config for instance that should be created
 * @constructor
 */
function SearchModule(config) {
  this.config = config;
}

/**
 * Fetches the articles
 * @returns {Promise} - result of get articles
 */
SearchModule.prototype.get = function () {
  return requests()
    .get(this.config.get.endpoint, this.config.get.params)
    .then(res => this.parseArticles(res));
};

/**
 * Parses raw response from API with articles
 * @param {Object} res - response from API with articles
 * @returns {Array} - articles
 */
SearchModule.prototype.parseArticles = function (res) {
  return res.body.articles;
};

export default function init(config) {
  return new SearchModule(config);
}
