import axios from 'axios';

let configs = {
  init: false
};

/**
 * Get http method implementation
 * @param {String} url - endpoint to which request should be done
 * @param {Object} params - params object
 * @returns {Promise} - outcome of the request
 */
export function get(url, params) {
  return axios.get(url, params);
}

const module = {
  get
};

/**
 * Init function for requests service.
 * If module is already inited it won't be reinitted.
 * @param {Object} moduleConfig - config for module (see example in test)
 * @returns {{get: get}} - requests service
 */
export default function init(moduleConfig) {
  // return module if it's already initted
  if (configs.init) {
    return module;
  }

  // if not
  // merge the configs and change the initted flag
  configs = Object.assign({}, configs, moduleConfig);
  configs.init = true;

  // and return module
  return module;
}
