import util from 'util';
import { TimerOptions } from 'node:timers';
export default () => util.promisify(setTimeout);
