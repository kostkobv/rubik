import compileTemplate from 'lodash/template';
import Observable from 'zen-observable';
import SearchModule from '../modules/search';

/**
 * Search View.
 * Handles the search.
 *
 * @param {Object} config - search view configs
 * @constructor
 */
function SearchView(config) {
  // link model instance
  this.model = new SearchModule(config.model);

  // compile templates
  this.renderResult = compileTemplate(config.templates.result);
  this.renderPage = compileTemplate(config.templates.page);

  // if there are no selectors in config - break
  if (!config.selectors) {
    return;
  }

  // link DOM elements
  this.element = document.querySelector(config.selectors.element);
  this.searchForm = this.element.querySelector(config.selectors.form.element);
  this.searchResults = this.element.querySelector(config.selectors.results.element);
  this.searchResultsCount = this.element.querySelector(config.selectors.results.count);

  // link configs
  this.config = config;

  // start listening to form submits
  this.initListeners().subscribe(data => this.fetch(data));
}

/**
 * Fetches the data from model and renders the layout by default on the 0 page
 * @param {Object} values - form values
 */
SearchView.prototype.fetch = function (values) {
  const params = Object.assign({}, { action: this.config.model.get.action }, values);
  this.model.fetch(params).then(() => this.renderLayout(0));
};

/**
 * Parses the data from form elements
 * @param {Array<Node>} formElements - array with form elements
 * @returns {Object} - parsed form data
 */
function parseFormElements(formElements) {
  const formData = {};

  // iterate through elements
  for (const element of formElements) {
    // get key as the element name
    const name = element.getAttribute('name');

    // TODO: add validation and check schema for data that are coming from form
    if (name) {
      // if name is valid get the value from there
      formData[name] = element.value;
    }
  }

  return formData;
}

/**
 * Inits the form listeners
 *
 * @returns {Observable|*} - stream observable on which is possible to subscribe for form submition
 */
SearchView.prototype.initListeners = function () {
  // create observable
  this.formSubmitStream = new Observable((observer) => {
    // get the elements
    const formElements = this.searchForm.elements;
    const searchFormFilters = this.searchForm.querySelectorAll(this.config.selectors.form.filters);

    // init handler for submition
    const handler = () => {
      // parse elements
      const values = parseFormElements(formElements);

      // send data to the stream
      observer.next(values);
    };

    // init handler for change event
    const filterChangeHandler = (event) => {
      // change should come only from form elements
      if (Array.prototype.indexOf.call(searchFormFilters, event.target) === -1) {
        return;
      }

      // and then submit event is triggered
      handler();
    };

    // listen for submit and change events
    this.searchForm.addEventListener('submit', handler, true);
    this.searchForm.addEventListener('change', filterChangeHandler, true);

    return () => {
      // give ability to unchain the submit and change listeners later
      this.searchForm.removeEventListener('submit', handler);
      this.searchForm.removeEventListener('change', filterChangeHandler);
    };
  });

  return this.formSubmitStream;
};

/**
 * Renders count of results to layout
 */
SearchView.prototype.renderResultsCount = function () {
  if (!this.searchResultsCount) {
    return;
  }

  const resultsCountLayout = this.model.getArticlesCount();

  this.searchResultsCount.innerHTML = resultsCountLayout;
};

/**
 * Renders the layout with results
 *
 * @param {Number} page - page number that should be rendered
 */
SearchView.prototype.renderLayout = function (page) {
  // fetch the articles for the current page
  const articles = this.model.getArticles(page);
  let layout = '';

  // render results count to layout
  this.renderResultsCount();

  // generate the layout HTML
  articles.forEach((article) => {
    layout += this.renderResult({ article });
  });

  // render it into DOM
  this.searchResults.innerHTML = layout;
};

export default function init(config) {
  return new SearchView(config);
}
