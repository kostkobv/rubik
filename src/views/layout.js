import compileTemplate from 'lodash/template';
import Observable from 'zen-observable';
import LayoutModule from '../modules/layout';

/**
 * Gets the slot where item is currently rendered
 * @private
 * @param {Node} item - layout item
 * @param {String} slotAttributeName - slot attribute name
 * @returns {Node} - layout slot where item is rendered
 */
function getItemSlot(item, slotAttributeName) {
  // do not go higher than this level of parentness
  const LIMIT = 5;
  let parent = item;

  for (let index = 0; index < LIMIT; index += 1) {
    if (parent.hasAttribute(slotAttributeName)) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return null;
}

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

  this.initClickListeners();

  this.initLayoutDropListeners().forEach((res) => {
    const { slot, data, source } = res;

    // if data was moved within layout
    if (!Number.isNaN(source)) {
      // remove the source
      this.removeItem(this.slots[source]);
    }

    const index = this.getSlotIndex(slot);
    this.dropItem(data, index);
  });

  this.initLayoutDragListeners()
    .forEach((res) => {
      const { slot, dataTransfer } = res;
      this.setDragData(slot, dataTransfer);
    });

  this.initLayoutRemoveListeners()
    .forEach(item => this.removeItem(item));
}

/**
 * Sets the item to the data transfer
 * @param {Node} slot - slot from which item should be retrieved
 * @param {DataTransfer} dataTransfer - drag event data transfer
 */
LayoutView.prototype.setDragData = function (slot, dataTransfer) {
  const slotIndex = this.getSlotIndex(slot);
  const item = this.model.getArticle(slotIndex);
  const parseItem = JSON.stringify(item);

  dataTransfer.setData('text', parseItem);
  dataTransfer.setData('source', slotIndex);
};

/**
 * Creates stream with dragged items from within layout
 * @returns {Observable} - stream with dragged items
 */
LayoutView.prototype.initLayoutDragListeners = function () {
  const config = this.config;

  this.dragLayoutStream = new Observable((observer) => {
    function handler(e) {
      const target = e.target;
      const slot = getItemSlot(target, config.attributes.slot);

      if (!slot) {
        return;
      }

      const dataTransfer = e.dataTransfer;

      observer.next({ slot, dataTransfer });
    }

    this.element.addEventListener('dragstart', e => handler(e));

    return () => {
      this.element.removeEventListener('dragstart', handler);
    };
  });

  return this.dragLayoutStream;
};

/**
 * Creates stream with dropped items
 * @returns {Observable} - stream with dropped items
 */
LayoutView.prototype.initLayoutDropListeners = function () {
  this.dropLayoutStream = new Observable((observer) => {
    const handler = e => this.layoutDropHandler(e, observer);

    this.element.addEventListener('drop', e => handler(e));

    return () => {
      this.element.removeEventListener('drop', handler);
    };
  });

  return this.dropLayoutStream;
};

/**
 * Layout drop events stream handler
 * @param {DragEvent} event - drop event
 * @param {Observer} observer - layout drop events observer instance
 */
LayoutView.prototype.layoutDropHandler = function (event, observer) {
  const target = event.target;
  const slot = getItemSlot(target, this.config.attributes.slot);

  if (!slot) {
    return;
  }

  // retrieve droppable data
  const unparsedData = event.dataTransfer.getData('text');
  const data = JSON.parse(unparsedData);

  // retrieve source if it there
  const unparsedSource = event.dataTransfer.getData('source');
  const source = parseInt(unparsedSource, 10);

  observer.next({ slot, data, source });
};

/**
 * Creates the stream with all the remove item events
 * @returns {Observable} - observer with remove item events
 */
LayoutView.prototype.initLayoutRemoveListeners = function () {
  const removeItemAttribute = this.config.attributes.remove;
  return this.layoutEventStream.filter(item => item.hasAttribute(removeItemAttribute));
};

/**
 * Creates the stream with all the click events within the layout view
 */
LayoutView.prototype.initClickListeners = function () {
  this.layoutEventStream = new Observable((observer) => {
    function handler(e) {
      const target = e.target;

      observer.next(target);
    }

    this.element.addEventListener('click', e => handler(e));

    return () => {
      this.slots.removeEventListener('click', handler);
    };
  });
};

/**
 * Removes item from the layout
 * @param {Node} item - item that should be removed
 */
LayoutView.prototype.removeItem = function (item) {
  // get the Node of the slot where item "lives"
  const slot = getItemSlot(item, this.config.attributes.slot);

  if (!slot) {
    return;
  }

  // get the index of the slot
  const itemIndex = this.getSlotIndex(slot);

  if (itemIndex === -1) {
    return;
  }

  // render the fallback
  this.renderEmpty(itemIndex);
  // remove from the stack
  this.model.removeArticle(itemIndex);
};

LayoutView.prototype.getSlotIndex = function (slot) {
  return Array.prototype.indexOf.call(this.slots, slot);
};

/**
 * Renders fallback content into empty slot
 * @param {Number} index - index of the slot that should be emptied
 */
LayoutView.prototype.renderEmpty = function (index) {
  const slot = this.slots[index];

  // if there is no slot or there is a need of empty template re-render - break
  if (!slot || slot.innerHTML === this.config.templates.empty) {
    return;
  }

  slot.innerHTML = this.config.templates.empty;
};

/**
 * Renders the item from the stack to the layout
 * @param {Number} index - index of the item that should be re-rendered
 */
LayoutView.prototype.renderItem = function (index) {
  const item = this.model.stack[index];
  const slot = this.slots[index];

  if (!slot) {
    return;
  }

  if (!item) {
    this.renderEmpty(index);
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

  this.model.pushArticle(slotIndex, item);

  // if slot is empty
  if (!actualSlotContent) {
    this.slots[slotIndex].innerHTML = this.renderSlot(item);
    return;
  }

  // render everything after the changed item in the stack if the slot wasn't empty
  this.render(slotIndex);
};

export default function init(config) {
  return new LayoutView(config);
}
