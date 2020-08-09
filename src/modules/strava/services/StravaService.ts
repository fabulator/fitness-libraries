import { inject, injectable, named } from 'inversify';
import { Activity, Api, ApiScope, Stream, WebApi } from 'strava-api-handler';
import { ActivityFilters } from 'strava-api-handler/src/types/ActivityFilters';
import { SYMBOLS } from '../constants';
import StravaStorageService from './StravaStorageService';

function waitForIt(waitingTime: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, waitingTime);
    });
}

@injectable()
export default class StravaService {
    public constructor(
        @inject(Api) protected api: Api,
        @inject(StravaStorageService) protected storage: StravaStorageService,
        @inject(WebApi) protected webApi: WebApi,
        @inject(SYMBOLS.env) @named(SYMBOLS.returnUrl) protected returnUrl: string,
    ) {}

    public getApi() {
        return this.api;
    }

    public getWebApi() {
        return this.webApi;
    }

    public getLoginUrl(scopes: ApiScope[]) {
        return this.api.getLoginUrl(this.returnUrl, scopes);
    }

    public async authorize(code: string): Promise<{ access_token: string }> {
        const token = await this.api.requestAccessToken(code);
        await this.storage.store(token);
        return token;
    }

    public async getActivity(id: number) {
        return this.api.getActivity(id);
    }

    public async getActivities(filters: ActivityFilters = {}) {
        return this.api.getActivities(filters);
    }

    protected async getActivityFromUpload(uploadId: number): Promise<number> {
        const { activity_id } = await this.api.getUploadStatus(uploadId);

        if (activity_id) {
            return activity_id;
        }

        await waitForIt(500);

        return this.getActivityFromUpload(uploadId);
    }

    public async createActivity(activity: Activity, type?: 'gpx' | 'fit', content?: string | Buffer): Promise<Activity<number>> {
        if (!type || !content) {
            return this.api.createActivity(activity);
        }

        const upload = await this.api.uploadActivity(activity, content, Math.random(), type);
        const activityId = await this.getActivityFromUpload(upload.id);

        const uploadedActivity = activity.setId(activityId);

        await this.api.updateActivity(uploadedActivity);
        await this.api.updateActivity(uploadedActivity);

        return uploadedActivity;
    }

    public async getActivityPoint(activity: Activity<number>) {
        const points = await this.api.getStream(activity.getId(), [
            Stream.HEARTRATE,
            Stream.LATNG,
            Stream.CADENCE,
            Stream.TIME,
            Stream.ALTITUDE,
            Stream.TEMP,
        ]);

        return points.map((point) => {
            const [lat, lon] = point[Stream.LATNG];

            return {
                lat,
                lon,
                time: activity.getStart().plus({ seconds: point[Stream.TIME] }).toJSDate(),
                [Stream.CADENCE]: point[Stream.CADENCE],
                [Stream.HEARTRATE]: point[Stream.HEARTRATE],
                [Stream.TEMP]: point[Stream.TEMP],
                [Stream.ALTITUDE]: point[Stream.ALTITUDE],
            };
        });
    }
}
