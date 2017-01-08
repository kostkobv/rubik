import compileTemplate from 'lodash/template';
import Observable from 'zen-observable';
import SearchModule from '../modules/search';

const FIRST_PAGE_INDEX = 0;

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
  this.paginationPages = this.element.querySelector(config.selectors.pagination.element);
  this.paginationNextPage = this.element.querySelector(config.selectors.pagination.next);
  this.paginationPreviousPage = this.element.querySelector(config.selectors.pagination.previous);

  // link configs
  this.config = config;

  // start listening to form submits
  this.initFormListeners().subscribe(data =>
    this.fetch(data).then(() => this.renderLayout(FIRST_PAGE_INDEX))
  );

  this.initPaginationListeners().subscribe(pageNumber => this.renderLayout(pageNumber));

  this.initDragItemListeners().forEach(e => this.attachDataToDragEvent(e));
}

/**
 * Handles the drag of the result and attaches data to the event itself
 * @param {Event} event - drag event of the result
 */
SearchView.prototype.attachDataToDragEvent = function (event) {
  const itemId = event.target.getAttribute(this.config.attributes.result);
  const itemData = this.model.getArticle(itemId);
  const stringifiedItemData = JSON.stringify(itemData);

  event.dataTransfer.setData('text/plain', stringifiedItemData);
  event.dataTransfer.dropEffect = 'copy'; // eslint-disable-line no-param-reassign
};


SearchView.prototype.initDragItemListeners = function () {
  this.dragItemEventsStream = new Observable((observer) => {
    function handler(e) {
      const target = e.target;

      if (target.hasAttribute(this.config.attributes.result)) {
        observer.next(e);
      }
    }

    this.searchResults.addEventListener('dragstart', e => handler(e));

    return () => {
      this.searchResults.removeEventListener('dragstart', handler);
    };
  });

  return this.dragItemEventsStream;
};

/**
 * Fetches the data from model and renders the layout by default on the 0 page
 * @param {Object} values - form values
 * @returns {Promise} - result of fetching the data from API
 */
SearchView.prototype.fetch = function (values) {
  const params = Object.assign({}, { action: this.config.model.get.action }, values);
  return this.model.fetch(params);
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
SearchView.prototype.initFormListeners = function () {
  // create observable
  return new Observable((observer) => {
    // get the elements
    const formElements = this.searchForm.elements;
    const searchFormFilters = this.searchForm.querySelectorAll(this.config.selectors.form.filters);

    // init handler for submition
    const handler = (e) => {
      e.preventDefault();

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
};


/**
 * Inits the pagination listeners
 *
 * @returns {Observable|*} - stream observable on which is possible to subscribe
 *          for pagination events
 */
SearchView.prototype.initPaginationListeners = function () {
  return new Observable((observer) => {
    const model = this.model;
    const searchPageAttribute = this.config.attributes.searchPage;
    const disabledResult = this.config.attributes.disabledResult;

    function handler(e) {
      const clickedPageNumber = e.target.getAttribute(searchPageAttribute);
      const parsedClickedPageNumber = parseInt(clickedPageNumber, 10);

      if (parsedClickedPageNumber < 0 || parsedClickedPageNumber === model.page) {
        return;
      }

      observer.next(parsedClickedPageNumber);
    }

    function nextHandler(e) {
      if (e.target.getAttribute(disabledResult) === 'true') {
        return;
      }

      observer.next(model.page + 1);
    }

    function prevHandler(e) {
      if (e.target.getAttribute(disabledResult) === 'true') {
        return;
      }

      observer.next(model.page - 1);
    }

    this.paginationPages.addEventListener('click', handler);
    this.paginationNextPage.addEventListener('click', nextHandler);
    this.paginationPreviousPage.addEventListener('click', prevHandler);

    return () => {
      // give ability to unchain the pagination listeners later
      this.paginationPages.removeEventListener('click', handler);
      this.paginationNextPage.removeEventListener('click', nextHandler);
      this.paginationPreviousPage.removeEventListener('click', prevHandler);
    };
  });
};

/**
 * Renders count of results to layout
 */
SearchView.prototype.renderResultsCount = function () {
  if (!this.searchResultsCount) {
    return;
  }

  this.searchResultsCount.innerHTML = this.model.getArticlesCount();
};

/**
 * Returns index of the first page that should be rendered in the pagination
 *
 * Required params:
 *    pagesCount - represents the number of pages that are available
 *    articlesPerPage - represents the max number of articles that could be shown per page
 *    actualPageNumber - actual page number
 *    maxPagesCount - represents the max number of pages that could be shown in pagination
 *
 * @param {{ pagesCount: Number, articlesPerPage: Number, actualPageNumber: Number,
 *    maxPagesCount: Number }} params - parameters for doing calculations
 * @returns {{ firstPageToRenderIndex: Number, lastPageToRenderIndex: Number }} - first page that
 *      should be rendered in pagination index
 */
function getFirstLastPageToRenderIndex(params) {
  // destructuring needed parameters from passed argument
  const { pagesCount, articlesPerPage, actualPageNumber, maxPagesCount } = params;

  // counting the shift for number of pages shown in pagination before and after current one
  const articlesNumberShift = Math.floor(maxPagesCount / 2);
  let firstPageToRenderIndex = actualPageNumber - articlesNumberShift;
  let lastPageToRenderIndex = actualPageNumber + articlesNumberShift;

  // if the actual page is almost in the end
  if (pagesCount - articlesPerPage < actualPageNumber) {
    // do not shift the pagination anymore
    firstPageToRenderIndex = pagesCount - articlesNumberShift - 1;
    lastPageToRenderIndex = pagesCount;
  //  if it's in the beginning
  } else if (actualPageNumber <= articlesNumberShift) {
    // also do not shift it
    firstPageToRenderIndex = FIRST_PAGE_INDEX;
    // indexation starts from zero
    lastPageToRenderIndex = maxPagesCount - 1;
  }

  // if calculated index is smaller than first page index (because number of pages is smaller than
  // max pages count) it should still start from the first page
  if (firstPageToRenderIndex < FIRST_PAGE_INDEX) {
    firstPageToRenderIndex = FIRST_PAGE_INDEX;
  }

  if (lastPageToRenderIndex > pagesCount - 1) {
    lastPageToRenderIndex = pagesCount - 1;
  }

  return { firstPageToRenderIndex, lastPageToRenderIndex };
}

/**
 * Renders the pagination into layout
 */
SearchView.prototype.renderPagination = function () {
  const actualPageNumber = this.model.page;
  const articlesPerPage = this.config.model.articlesPerPage;
  const maxPagesCount = this.config.options.pagination.maxPagesCount;
  const pagesCount = this.model.pagesCount;

  const pagesToRenderIndex = getFirstLastPageToRenderIndex({
    pagesCount,
    articlesPerPage,
    actualPageNumber,
    maxPagesCount
  });

  let layout = '';
  const { firstPageToRenderIndex, lastPageToRenderIndex } = pagesToRenderIndex;

  for (let pageIndex = firstPageToRenderIndex; pageIndex <= lastPageToRenderIndex; pageIndex += 1) {
    layout += this.renderPage({
      page: {
        active: pageIndex === actualPageNumber,
        number: pageIndex
      }
    });
  }

  this.handlePreviousNextPaginationButtons();

  this.paginationPages.innerHTML = layout;
};

/**
 * Handles the active/non-active state of the previous and next buttons in pagination
 */
SearchView.prototype.handlePreviousNextPaginationButtons = function () {
  const actualPage = this.model.page;
  const dataDisabled = this.config.attributes.disabledResult;

  if (actualPage === this.model.pagesCount - 1) {
    this.paginationNextPage.setAttribute(dataDisabled, true);
  } else {
    this.paginationNextPage.setAttribute(dataDisabled, false);
  }

  if (actualPage === FIRST_PAGE_INDEX) {
    this.paginationPreviousPage.setAttribute(dataDisabled, true);
  } else {
    this.paginationPreviousPage.setAttribute(dataDisabled, false);
  }
};

/**
 * Renders the layout with results and pagination
 *
 * @param {Number} page - page number that should be rendered
 */
SearchView.prototype.renderLayout = function (page) {
  // render results count to layout
  this.renderResults(page);
  this.renderResultsCount();
  this.renderPagination();
};

/**
 * Renders the results with articles
 *
 * @param {Number} page - page number that should be rendered
 */
SearchView.prototype.renderResults = function (page) {
  // fetch the articles for the current page
  const articles = this.model.getArticles(page);
  let layout = '';

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
