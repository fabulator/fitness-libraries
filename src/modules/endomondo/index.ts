import {
    ContainerModule,
    interfaces,
} from 'inversify';
import { Api as EndomondoApi, MobileApi } from 'endomondo-api-handler';

import {
    EndomondoService,
    EndomondoApiStorageService,
    EndomondoMobileApiStorageService,
    EndomondoApiHandler,
    EndomondoMobileApiHandler,
} from './services';
import { SYMBOLS } from './constants';

export default new ContainerModule(
    (bind: interfaces.Bind) => {
        bind(SYMBOLS.env).toConstantValue('ENDOMONDO_API').whenTargetNamed(SYMBOLS.apiStorageName);
        bind(SYMBOLS.env).toConstantValue('ENDOMONDO_MOBILE_API').whenTargetNamed(SYMBOLS.mobileApiStorageName);

        bind(SYMBOLS.apiStorage).to(EndomondoApiStorageService);
        bind(SYMBOLS.mobileApiStorage).to(EndomondoMobileApiStorageService);

        bind(EndomondoApi).to(EndomondoApiHandler);
        bind(MobileApi).to(EndomondoMobileApiHandler);

        bind(EndomondoService).toSelf();
    },
);

export { EndomondoService, SYMBOLS };
