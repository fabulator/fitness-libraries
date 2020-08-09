import { Api as FitbitApi, ApiScope } from 'fitbit-api-handler';
import { inject, injectable, named } from 'inversify';
import { SYMBOLS } from '../constants';
import FitbitStorageService from './FitbitStorageService';

@injectable()
export default class FitbitService {
    public constructor(
        @inject(FitbitApi) protected fitbitApi: FitbitApi,
        @inject(FitbitStorageService) protected storage: FitbitStorageService,
        @inject(SYMBOLS.env) @named(SYMBOLS.returnUrl) protected returnUrl: string,
    ) {}

    public getApi() {
        return this.fitbitApi;
    }

    public getLoginUrl(
        scopes: ApiScope[] = [ApiScope.ACTIVITY, ApiScope.HEARTRATE, ApiScope.LOCATION, ApiScope.PROFILE, ApiScope.SLEEP],
    ): string {
        return this.fitbitApi.getLoginUrl(this.returnUrl, scopes, { responseType: 'code' });
    }

    public async authorize(code: string) {
        const token = await this.fitbitApi.requestAccessToken(code, this.returnUrl);
        await this.storage.store(token);
    }
}
