import { ContainerModule, interfaces } from 'inversify';
import { Api as FitbitApi } from 'fitbit-api-handler';
import { FitbitService, FitbitStorageService, FitbitApiHandler } from './services';

export { FitbitService };
export { SYMBOLS } from './constants';

export default new ContainerModule(
    (bind: interfaces.Bind) => {
        bind(FitbitStorageService)
            .toSelf();

        bind(FitbitApi).to(FitbitApiHandler);

        bind(FitbitService).toSelf();
    },
);
