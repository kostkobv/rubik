// import compileTemplate from 'lodash/template';
// import Observable from 'zen-observable';
import LayoutModule from '../modules/layout';

function LayoutView(config) {
  this.config = config;

  this.model = new LayoutModule(config.model);

  // this.renderItem = compileTemplate(config.templates.item);
}

export default function init(config) {
  return new LayoutView(config);
}
