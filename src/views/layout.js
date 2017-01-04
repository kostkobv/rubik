// import compileTemplate from 'lodash/template';
// import Observable from 'zen-observable';
import LayoutModule from '../modules/layout';

function LayoutView(config) {
  this.config = config;

  // create model
  this.model = new LayoutModule(config.model);

  // this.renderItem = compileTemplate(config.templates.item);

  // if there are no selectors in config - break
  if (!config.selectors) {
    return;
  }

  this.element = document.querySelector(config.selectors.element);
  this.slots = this.element.querySelectorAll(config.selectors.slot);
}

export default function init(config) {
  return new LayoutView(config);
}
