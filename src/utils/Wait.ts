import util from 'util';
export default () => util.promisify(setTimeout);
