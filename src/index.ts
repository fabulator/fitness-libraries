import 'cross-fetch/polyfill';
import 'reflect-metadata';
import * as ENDOMONDO from './modules/endomondo';
import * as FITBIT from './modules/fitbit';
import * as GARMIN from './modules/garmin';
import * as STRAVA from './modules/strava';

export { ENDOMONDO, GARMIN, FITBIT, STRAVA };
