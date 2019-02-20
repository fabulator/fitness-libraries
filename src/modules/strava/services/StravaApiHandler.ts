import { inject, injectable, named } from 'inversify';
import { DateTime } from 'luxon';
import { Api } from 'strava-api-handler';
import StravaStorageService from './StravaStorageService';
import { SYMBOLS } from '../constants';

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

@injectable()
export default class StravaApiHandler extends Api {
    public constructor(
        @inject(StravaStorageService) private storage: StravaStorageService,
        @inject(SYMBOLS.env) @named(SYMBOLS.clientId) clientId: string,
        @inject(SYMBOLS.env) @named(SYMBOLS.secretId) secretId: string,
    ) {
        super(clientId, secretId);
    }

    public async request(...parameters: ArgumentsType<typeof Api.prototype.request>) {
        if (parameters[0].includes('oauth/token')) {
            return super.request(...parameters);
        }

        const token = this.storage.get();

        if (!token) {
            return super.request(...parameters);
        }

        this.setAccessToken(token.access_token);

        if (DateTime.local().toSeconds() >= token.expires_at) {
            const refreshedToken = await this.refreshToken(token.refresh_token);
            this.storage.store(refreshedToken);
        }

        return super.request(...parameters);
    }
}
