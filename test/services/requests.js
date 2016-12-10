import requests from '../../src/services/requests';
import config from '../config/services/requests.json';

describe('requests service', () => {
  before(() => {
    requests(config);
  });

  it('should not init itself twice', () => {
    //
  });
});
