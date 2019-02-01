// @flow
/**
 * Application entry point
 */

// Load application styles
// $FlowFixMe
import 'styles/index.scss';
import $ from 'jquery';
import run from './world.js';

$(document).ready(function() {
  run();
});
