import util from 'node:util';
export default () => util.promisify(setTimeout);
