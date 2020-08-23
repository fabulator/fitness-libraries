import { Activity, GarminApi } from 'garmin-api-handler';
import { inject, injectable } from 'inversify';
import unzipper from 'unzipper';

@injectable()
export default class GarminService {
    public constructor(@inject(GarminApi) protected api: GarminApi) {}

    public getApi() {
        return this.api;
    }

    public async getFitFile(activityId: number) {
        const exportFile = await this.api.getActivityFile(activityId);
        const buffer = Buffer.from(await exportFile.arrayBuffer());
        const directory = await unzipper.Open.buffer(buffer);
        return directory.files[0].buffer();
    }

    public async createActivity(activity: Activity): Promise<Activity<number>>;

    public async createActivity(activity: Activity, type: 'gpx', content: string): Promise<Activity<number>>;

    public async createActivity(activity: Activity, type: 'fit', content: Buffer): Promise<Activity<number>>;

    public async createActivity(activity: Activity, type?: 'gpx' | 'fit', content?: string | Buffer): Promise<Activity<number>> {
        if (type === 'gpx' && typeof content === 'string') {
            const activityId = await this.api.uploadGpx(content);
            return this.api.updateActivity(activity.setId(activityId));
        }

        if (type === 'fit' && content) {
            const activityId = await this.api.upload(content, 'fit');
            return this.api.updateActivity(activity.setId(activityId));
        }

        return this.api.createActivity(activity);
    }
}
