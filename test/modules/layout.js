import expect from '../requires';
import layout from '../../src/modules/layout';
import config from '../config/modules/layout.json';

describe('layout module', () => {
  let layoutInstance;

  before(() => {
    layoutInstance = layout(config);
  });

  it('should create new instance each time', () => {
    const testConfig = { test: 'test' };
    const newLayoutInstance = layout(testConfig);

    expect(layoutInstance).not.contain(testConfig);
    return expect(newLayoutInstance).not.eql(layoutInstance).and.contain(testConfig);
  });

  it('should have a stack of the articles within', () => {
    expect(layoutInstance).to.have.property('stack');
  });

  describe('stack', () => {
    beforeEach(() => {
      layoutInstance = layout(config);
    });

    it('should be able to add elements to the stack from the config', () => {
      expect(layoutInstance.stack.length).to.be.equal(10);
    });

    it('should leave empty slots in stack if there was no data assigned there', () =>
      expect(layoutInstance.stack[8]).to.be.undefined
    );

    describe('delete article', () => {
      it('should be able to remove element from the stack', () => {
        layoutInstance.removeArticle(2);

        return expect(layoutInstance.stack[2]).to.be.undefined;
      });

      it('should not shift articles after delete', () => {
        const ninethArticle = layoutInstance.stack[9];

        layoutInstance.removeArticle(2);

        expect(layoutInstance.stack[9]).to.be.eql(ninethArticle);
        return expect(layoutInstance.stack[2]).to.be.undefined;
      });
    });

    describe('push article', () => {
      it('should shift the whole stack if article was added to the stack onto non-empty slot', () => {
        const testArticle = { ID: 202, content: {} };
        const oldArticle = layoutInstance.stack[1];
        const ninethArticle = layoutInstance.stack[9];

        layoutInstance.pushArticle(1, testArticle);

        expect(layoutInstance.stack[1]).to.be.eql(testArticle);
        expect(layoutInstance.stack[2]).to.be.eql(oldArticle);
        expect(layoutInstance.stack[10]).to.be.eql(ninethArticle);
        return expect(layoutInstance.stack.length).to.be.equal(11);
      });

      it('should not shift the stack if article was added to the stack onto empty slot', () => {
        const testArticle = { ID: 202, content: {} };
        const ninethArticle = layoutInstance.stack[9];

        layoutInstance.pushArticle(4, testArticle);

        expect(layoutInstance.stack.length).to.be.equal(10);
        expect(layoutInstance.stack[4]).to.be.eql(testArticle);
        expect(layoutInstance.stack[9]).to.be.eql(ninethArticle);
      });
    });

    describe('edit article', () => {
      it('should merge the content of the article that is edited', () => {
        const testArticle = { content: { title: 'newTitle' } };
        const originalArticle = layoutInstance.stack[0];
        const mergedArticle = Object.assign({}, originalArticle);

        mergedArticle.content = Object.assign({}, originalArticle.content, testArticle.content);
        layoutInstance.editArticle(0, testArticle);

        expect(layoutInstance.stack[0].content.title).to.be.equal(testArticle.content.title);
        expect(layoutInstance.stack[0].ID).to.be.equal(originalArticle.ID);
      });

      it('should not allow to edit the article in the slot if slot is empty', () => {
        const testArticle = { ID: 202, content: {} };
        const result = layoutInstance.editArticle(4, testArticle);

        return expect(result).to.be.false;
      });
    });
  });
});
