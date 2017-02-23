import frameApi from '../src';
import chai, { expect } from 'chai';
// import { spy, stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('frameAPi', () => {
	it('should be a function', () => {
		expect(frameApi).to.be.a('function');
	});
});
