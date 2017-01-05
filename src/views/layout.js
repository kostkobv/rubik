import compileTemplate from 'lodash/template';
// import Observable from 'zen-observable';
import LayoutModule from '../modules/layout';

function LayoutView(config) {
  this.config = config;

  // create model
  this.model = new LayoutModule(config.model);

  this.renderSlot = compileTemplate(config.templates.item);

  // if there are no selectors in config - break
  if (!config.selectors) {
    return;
  }

  this.element = document.querySelector(config.selectors.element);
  this.slots = this.element.querySelectorAll(config.selectors.slot);
}

/**
 * Renders the item from the stack to the layout
 * @param {Number} index - index of the item that should be re-rendered
 */
LayoutView.prototype.renderItem = function (index) {
  const item = this.model.stack[index];
  const slot = this.slots[index];

  if (!slot || !item) {
    return;
  }

  const itemContent = this.renderSlot(item);

  // if content of the slot didn't change - just skip it
  if (itemContent === slot) {
    return;
  }

  slot.innerHTML = itemContent;
};

/**
 * Renders stack into the layout
 *
 * @param {Number} startIndex - start rendering the stack from specific index (0 by default)
 */
LayoutView.prototype.render = function (startIndex = 0) {
  const stack = this.model.stack;

  for (let index = startIndex; index < stack.length; index += 1) {
    this.renderItem(index);
  }
};

/**
 * Callback for the afterdrop action
 *
 * @param {Object} item - item that should be added to the stack
 * @param {Number} slotIndex - index onto which item should be added
 */
LayoutView.prototype.dropItem = function (item, slotIndex) {
  const actualSlotContent = this.model.stack[slotIndex];

  if (!actualSlotContent) {
    this.model.stack[slotIndex] = item;
    this.slots[slotIndex] = this.renderSlot(item);
    return;
  }

  this.model.pushArticle(slotIndex, item);

  // render everything after the changed item in the stack if the slot wasn't empty
  this.render(slotIndex);
};

export default function init(config) {
  return new LayoutView(config);
}
