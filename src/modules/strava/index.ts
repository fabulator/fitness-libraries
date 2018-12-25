import { ContainerModule, interfaces } from 'inversify';
import { Api } from 'strava-api-handler';
import { StravaService, StravaStorageService, StravaApiHandler } from './services';
import { SYMBOLS } from './constants';

export default new ContainerModule(
    (bind: interfaces.Bind) => {
        bind(SYMBOLS.env).toConstantValue('STRAVA_API').whenTargetNamed(SYMBOLS.apiStorageName);

        bind(StravaStorageService)
            .toSelf();

        bind(Api).to(StravaApiHandler);

        bind(StravaService).toSelf();
    },
);

export { StravaService, SYMBOLS };
