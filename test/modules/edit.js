import sinon from 'sinon';
import expect from '../requires';
import edit from '../../src/modules/edit';
import config from '../config/modules/edit.json';

describe('edit module', () => {
  let editInstance;
  let sandbox;

  before(() => {
    editInstance = edit(config);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create new instance each time', () => {
    const testConfig = { test: 'test' };
    const newEditInstance = edit(testConfig);

    expect(editInstance).not.contain(testConfig);
    return expect(newEditInstance).not.eql(editInstance).and.contain(testConfig);
  });

  it('should be able to set the edited article', () => {
    const newConfig = {
      layout: {
        editArticle: () => {}
      },
      articleIndex: 2
    };

    const articleContent = {
      title: 'Title!'
    };

    const newEditInstance = edit(newConfig);

    sandbox.stub(newConfig.layout, 'editArticle').returns(true);
    const result = newEditInstance.setArticle(articleContent);

    expect(newConfig.layout.editArticle.calledOnce).to.be.equal(true);
    expect(newConfig.layout.editArticle).to.have.been
      .calledWith(newConfig.articleIndex, { content: articleContent });
    return expect(result).to.be.true;
  });
});
