import { ContainerModule, interfaces } from 'inversify';
import { Api, WebApi } from 'strava-api-handler';
import { SYMBOLS } from './constants';
import { StravaApiHandler, StravaService, StravaStorageService, StravaWebApiHandler, StravaWebStorageService } from './services';

export default new ContainerModule((bind: interfaces.Bind) => {
    bind(SYMBOLS.env).toConstantValue('STRAVA_API').whenTargetNamed(SYMBOLS.apiStorageName);

    bind(SYMBOLS.env).toConstantValue('STRAVA_WEB_API').whenTargetNamed(SYMBOLS.webApiStorageName);

    bind(StravaStorageService).toSelf();

    bind(StravaWebStorageService).toSelf();

    bind(Api).to(StravaApiHandler);

    bind(WebApi).to(StravaWebApiHandler);

    bind(StravaService).toSelf();
});

export { StravaService, SYMBOLS };
