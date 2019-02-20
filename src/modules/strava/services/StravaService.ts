import { inject, injectable, named } from 'inversify';
import { Activity, Api, TYPES } from 'strava-api-handler';
import StravaStorageService from './StravaStorageService';
import { SYMBOLS } from '../constants';

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
        @inject(SYMBOLS.env) @named(SYMBOLS.returnUrl) protected returnUrl: string,
    ) {
    }

    public getApi() {
        return this.api;
    }

    public getLoginUrl(scopes: Array<string>) {
        // @ts-ignore
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

    public async getActivities(filters: TYPES.ActivityFilters = {}) {
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

    public async getActivityPoint(activity: Activity<number>): Promise<Array<{
        lat: number,
        lon: number,
        time: Date,
        cadence: number,
        hr: number,
    }>> {
        // @ts-ignore
        const points = await this.api.getStream(activity.getId(), [
            Api.STREAM.HEARTRATE,
            Api.STREAM.LATNG,
            Api.STREAM.CADENCE,
            Api.STREAM.TIME,
        ]);

        return points.map((point: any) => {
            const {
                heartrate,
                time,
                cadence,
                latlng,
            } = point;

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
