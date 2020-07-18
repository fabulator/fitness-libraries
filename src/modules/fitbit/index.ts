import { Api as FitbitApi } from 'fitbit-api-handler';
import { ContainerModule, interfaces } from 'inversify';
import { FitbitApiHandler, FitbitService, FitbitStorageService } from './services';

export { SYMBOLS } from './constants';
export { FitbitService };

export default new ContainerModule((bind: interfaces.Bind) => {
    bind(FitbitStorageService).toSelf();

    bind(FitbitApi).to(FitbitApiHandler);

    bind(FitbitService).toSelf();
});
