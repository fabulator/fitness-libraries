import fs from 'fs';
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
        const zipFile = `./${activityId}.zip`;
        fs.writeFileSync(zipFile, Buffer.from(await exportFile.arrayBuffer()));
        const zip = fs.createReadStream(zipFile).pipe(unzipper.Parse({ forceStream: true }));
        // eslint-disable-next-line no-restricted-syntax
        for await (const entry of zip) {
            if (entry.path === `${activityId}.fit`) {
                entry.pipe(fs.createWriteStream(`./${activityId}.fit`));
            } else {
                entry.autodrain();
            }
        }
        const buffer = fs.readFileSync(`${activityId}.fit`);
        fs.unlinkSync(zipFile);
        fs.unlinkSync(`${activityId}.fit`);
        return buffer;
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
