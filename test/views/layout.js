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

    it('should be able to render content to the appropriate slots', () => {
      layoutViewInstance.render();

      const slots = document.querySelectorAll('[data-layout-slot]');
      const expectedHtml = '<div></div>';

      expect(slots[1].innerHTML).to.be.equal(expectedHtml);
    });
  });
});
