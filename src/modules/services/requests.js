const popsicle = require('popsicle');

let inited = false;
let module;

/**
 * Get http method implementation
 * @param {String} url - endpoint to which request should be done
 * @param {Object} params - params object
 * @returns {Promise} - outcome of the request
 */
function get(url, params) {
  return popsicle.get({
      url: `${url}`,
      query: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .use(plugins.parse(['json', 'urlencoded']));
}

/**
 * Factory function for requests module
 * @returns {{get: get}} - module
 */
function getModule() {
  return {
    get
  };
}

/**
 * Init function for requests service.
 * If module is already inited it won't be reinited.
 * @param {Object} moduleConfig - config for module (see example in test)
 * @returns {{get: get}} - requests service
 */
export default function init(moduleConfig) {
  // return module if it's already inited
  if (inited) {
    return module;
  }

  // if not
  // create module object
  module = getModule();

  // merge the configs and change the inited flag
  module.config = Object.assign({}, moduleConfig);
  inited = true;

  // and return module
  return module;
}
