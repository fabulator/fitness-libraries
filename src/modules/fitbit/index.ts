import { Api as FitbitApi } from 'fitbit-api-handler';
import { ContainerModule } from 'inversify';
import { FitbitApiHandler, FitbitService, FitbitStorageService } from './services';

export { SYMBOLS } from './constants';
export { FitbitService };

export default new ContainerModule((bind) => {
    bind(FitbitStorageService).toSelf();

    bind(FitbitApi).to(FitbitApiHandler).inSingletonScope();

    bind(FitbitService).toSelf();
});
