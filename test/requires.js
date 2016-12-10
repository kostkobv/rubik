import nockService from 'nock';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

export const nock = nockService('http://localhost')
  .defaultReplyHeaders({
    'Content-Type': 'application/json'
  });

export default expect;
