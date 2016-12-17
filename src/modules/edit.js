/**
 * Edit module prototype
 * @param {Object} config - config for instance that should be created
 * @constructor
 */
function EditModule(config) {
  this.config = config;
}

/**
 * Sets the new article content into the stack
 *
 * @param {Object} content - new article content
 * @returns {boolean} - status of setting the article
 */
EditModule.prototype.setArticle = function (content) {
  if (!this.config || !this.config.layout || !this.config.articleIndex) {
    return false;
  }

  const article = { content };

  return this.config.layout.editArticle(this.config.articleIndex, article);
};

export default function init(config) {
  return new EditModule(config);
}
