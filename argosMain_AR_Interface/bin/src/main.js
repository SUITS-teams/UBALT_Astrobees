import '../node_modules/magic-script-polyfills/src/polyfills.js';
import { App } from './app.js';

// Add support for things like setTimeout, setInterval and fetch.

// Launch our app!
// The 0.5 value is the number of seconds to call `updateLoop` in an interval if
// there are no other events waking the event loop.
var main = new App(0.5);

export default main;
