import { inject, injectable, named } from 'inversify';
import { DateTime } from 'luxon';
import {
    Api as FitbitApi,
    SCOPES,
    Activity,
    TYPES,
} from 'fitbit-api-handler';
import FitbitStorageService from './FitbitStorageService';
import { SYMBOLS } from '../constants';

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

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

    public getLoginUrl(): string {
        return this.fitbitApi.getLoginUrl(this.returnUrl, [
            SCOPES.ACTIVITY,
            SCOPES.HEARTRATE,
            SCOPES.LOCATION,
            SCOPES.PROFILE,
        ], { responseType: 'code' });
    }

    public async authorize(code: string) {
        const token = await this.fitbitApi.requestAccessToken(code, this.returnUrl);
        this.storage.storeToken(token);
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

    public async getActivities(filters: TYPES.ActivityFilters) {
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
