import { ContainerModule, interfaces } from 'inversify';
import { GarminApi } from 'garmin-api-handler';
import { GarminService, GarminStorageService, GarminHandler } from './services';
import { SYMBOLS } from './constants';

export default new ContainerModule(
    (bind: interfaces.Bind) => {
        bind(SYMBOLS.env).toConstantValue('GARMIN_API').whenTargetNamed(SYMBOLS.apiStorageName);

        bind(GarminStorageService)
            .toSelf();

        bind(GarminApi).to(GarminHandler);

        bind(GarminService).toSelf();
    },
);

export { GarminService, SYMBOLS };
