import nockService from 'nock';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(sinonChai);

export const nock = nockService('http://localhost')
  .defaultReplyHeaders({
    'Content-Type': 'application/json'
  });

export default expect;
