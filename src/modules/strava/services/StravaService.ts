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
        this.storage.store(token);
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

    public async createActivity(activity: Activity, gpx?: string): Promise<Activity<number>> {
        if (!gpx) {
            return this.api.createActivity(activity);
        }

        const upload = await this.api.uploadActivity(activity, gpx, Math.random());
        const activityId = await this.getActivityFromUpload(upload.id);

        const uploadedActivity = activity.setId(activityId);

        await this.api.updateActivity(uploadedActivity);
        await this.api.updateActivity(uploadedActivity);

        return uploadedActivity;
    }

    public async getActivityPoint(
        activity: Activity<number>,
    ): Promise<
        {
            cadence: number;
            hr: number;
            lat: number;
            lon: number;
            time: Date;
        }[]
    > {
        const points = await this.api.getStream(activity.getId() as number, [Stream.HEARTRATE, Stream.LATNG, Stream.CADENCE, Stream.TIME]);

        return points.map((point) => {
            const { heartrate, time, cadence, latlng } = point;

            return {
                lat: latlng[0],
                lon: latlng[1],
                time: activity.getStart().plus({ seconds: time }).toJSDate(),
                cadence,
                hr: heartrate,
            };
        });
    }
}
