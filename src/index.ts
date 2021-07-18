import 'cross-fetch/polyfill';
import 'reflect-metadata';
import * as FITBIT from './modules/fitbit';
import * as GARMIN from './modules/garmin';
import * as STRAVA from './modules/strava';

export { GARMIN, FITBIT, STRAVA };
