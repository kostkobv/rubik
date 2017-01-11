import jsdom from 'mocha-jsdom';
import sinon from 'sinon';
import expect from '../requires';
import config from '../config/views/layout.json';
import LayoutView from '../../src/views/layout';

describe('Layout View', () => {
  let layoutViewInstance;
  let sandbox;

  jsdom();

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    document.body.innerHTML = '<div data-layout>' +
      '<div data-layout-slot></div>' +
      '<div data-layout-slot></div>' +
      '<div data-layout-slot></div>' +
      '<div data-layout-slot></div>' +
      '</div>';

    layoutViewInstance = LayoutView(config);

    sandbox.stub(layoutViewInstance.model, 'fetch').returns(
      Promise.resolve(config.model.articles)
    );

    layoutViewInstance.model.parseArticles(config.model.articles);
  });

  it('should create new instance each time', () => {
    const testConfig = Object.assign({}, config, { test: 'test' });
    const newLayoutView = LayoutView(testConfig);

    expect(layoutViewInstance).not.contain(testConfig);
    return expect(newLayoutView).not.eql(layoutViewInstance).and.contain(testConfig);
  });

  describe('slots', () => {
    it('should be able to retrieve slots from DOM', () =>
      expect(layoutViewInstance.slots.length).to.be.equal(4)
    );

    describe('render', () => {
      let slots;

      beforeEach(() => {
        slots = document.querySelectorAll('[data-layout-slot]');
        layoutViewInstance.render();
      });

      it('should render empty slot view if appropriate slot in stack is empty', () => {
        const emptySlot = slots[3];

        expect(emptySlot.innerHTML).to.be.equal(config.templates.empty);
      });

      it('should be able to render content to the appropriate slots', () => {
        const expectedHtml = '<div data-layout-item=""><div data-layout-item-remove=""></div>title240</div>';

        expect(slots[1].innerHTML).to.be.equal(expectedHtml);
      });

      describe('drag', () => {
        it('should be able to set item data if item is moved within the layout', () => {
          const slot = document.querySelector('[data-layout-slot]');
          const dataTransferStub = {
            setData: () => {}
          };

          const item = layoutViewInstance.model.stack[0];

          sandbox.spy(dataTransferStub, 'setData');

          layoutViewInstance.setDragData(slot, dataTransferStub);

          expect(dataTransferStub.setData.withArgs('source', 0).calledOnce).to.be.equal(true);
          expect(dataTransferStub.setData.withArgs('text', JSON.stringify(item)).calledOnce).to.be.equal(true);
        });
      });

      describe('drop', () => {
        it('should be able to render separate item', () => {
          const item = { content: { title: 'testtitle' } };
          layoutViewInstance.dropItem(item, 1);

          expect(slots[1].innerHTML)
            .to.be.equal(`<div data-layout-item=""><div data-layout-item-remove=""></div>${item.content.title}</div>`);
          expect(layoutViewInstance.model.stack[1].content.title).to.be.equal(item.content.title);
        });

        it('should move the article from the dropped zone if it was not empty', () => {
          const oldItem = slots[1].innerHTML;
          const oldItemFromStack = layoutViewInstance.model.stack[1].content.title;
          const nextOldItem = slots[2].innerHTML;
          const nextOldItemFromStack = layoutViewInstance.model.stack[2].content.title;
          const item = { content: { title: 'testtitle' } };
          layoutViewInstance.dropItem(item, 1);

          expect(slots[2].innerHTML).to.be.equal(oldItem);
          expect(layoutViewInstance.model.stack[2].content.title).to.be.equal(oldItemFromStack);
          expect(slots[3].innerHTML).to.be.equal(nextOldItem);
          expect(layoutViewInstance.model.stack[3].content.title).to.be.equal(nextOldItemFromStack);
        });

        it('should render only the slot if slot was empty', () => {
          const item = { content: { title: 'testtitle' } };
          layoutViewInstance.removeItem(slots[1].querySelector(`[${config.attributes.item}]`));

          sandbox.spy(layoutViewInstance, 'renderSlot');
          sandbox.spy(layoutViewInstance, 'render');

          layoutViewInstance.dropItem(item, 1);

          expect(slots[1].innerHTML)
            .to.be.equal(`<div data-layout-item=""><div data-layout-item-remove=""></div>${item.content.title}</div>`);
          expect(layoutViewInstance.model.stack[1].content.title).to.be.equal(item.content.title);
        });
      });

      describe('delete', () => {
        it('should be able to remove item from the layout', () => {
          const item = slots[0];
          const deleteItem = item.querySelector('[data-layout-item-remove]');

          deleteItem.click();

          expect(item.innerHTML).to.be.equal(config.templates.empty);
          return expect(layoutViewInstance.model.stack[0]).not.to.be.defined;
        });
      });
    });
  });
});
