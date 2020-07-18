import { Activity, Api as FitbitApi, ApiScope } from 'fitbit-api-handler';
import { ApiActivityFilters } from 'fitbit-api-handler/src/types/api/index';
import { inject, injectable, named } from 'inversify';
import { DateTime } from 'luxon';
import { ArgumentsType } from '../../../utils';
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
        await this.storage.storeToken(token);
    }

    public async getProfile(): Promise<Record<string, any>> {
        const { data } = await this.fitbitApi.get(this.fitbitApi.getApiUrl('profile'));
        return data;
    }

    public async getActivity(id: number) {
        return this.fitbitApi.getActivity(id);
    }

    public async getActivityTcx(id: number): Promise<string> {
        const { data } = await this.fitbitApi.get(this.fitbitApi.getApiUrl(`activities/${id}`, undefined, '1.1', 'tcx'));
        return data;
    }

    public async getActivities(filters: ApiActivityFilters) {
        const { activities } = await this.fitbitApi.getActivities(filters);
        return activities;
    }

    public async createActivity(activity: Activity) {
        return this.fitbitApi.logActivity(activity);
    }

    public async getIntradayData(...parameters: ArgumentsType<typeof FitbitApi.prototype.getIntradayData>) {
        return this.fitbitApi.getIntradayData(...parameters);
    }

    public async getActivitiesBetweenDates(from: DateTime, to: DateTime) {
        return this.fitbitApi.getActivitiesBetweenDates(from, to);
    }
}
