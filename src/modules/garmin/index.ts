import { GarminApi } from 'garmin-api-handler';
import { ContainerModule, interfaces } from 'inversify';
import { SYMBOLS } from './constants';
import { GarminHandler, GarminService, GarminStorageService } from './services';

export default new ContainerModule((bind: interfaces.Bind) => {
    bind(SYMBOLS.env).toConstantValue('GARMIN_API').whenTargetNamed(SYMBOLS.apiStorageName);

    bind(GarminStorageService).toSelf();

    bind(GarminApi).to(GarminHandler);

    bind(GarminService).toSelf();
});

export { GarminService, SYMBOLS, GarminStorageService, GarminHandler };
