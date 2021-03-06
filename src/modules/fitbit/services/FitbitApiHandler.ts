import { Api as FitbitApi, FitbitApiException } from 'fitbit-api-handler';
import { inject, injectable, named } from 'inversify';
import { DateTime } from 'luxon';
import { ArgumentsType } from '../../../utils';
import { SYMBOLS } from '../constants';
import FitbitStorageService from './FitbitStorageService';

@injectable()
export default class FitbitApiHandler extends FitbitApi {
    public constructor(
        @inject(FitbitStorageService) private storage: FitbitStorageService,
        @inject(SYMBOLS.env) @named(SYMBOLS.clientId) clientId: string,
        @inject(SYMBOLS.env) @named(SYMBOLS.secretId) secretId: string,
    ) {
        super(clientId, secretId);
    }

    public async request(...parameters: ArgumentsType<typeof FitbitApi.prototype.request>) {
        if (parameters[0].includes('oauth2/token')) {
            return super.request(...parameters);
        }

        const token = await this.storage.get();

        if (!token) {
            return super.request(...parameters);
        }

        const { expireDate, refresh_token, access_token } = token;

        if (DateTime.fromISO(expireDate) > DateTime.local()) {
            this.setAccessToken(access_token);
            return super.request(...parameters);
        }

        try {
            const refreshedToken = await this.extendAccessToken(refresh_token);
            await this.storage.store(refreshedToken);
            return super.request(...parameters);
        } catch (exception) {
            if (exception instanceof FitbitApiException && exception.hasError('invalid_grant')) {
                await this.storage.delete();
            }
            throw exception;
        }
    }
}
