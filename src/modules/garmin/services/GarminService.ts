import { Activity, GarminApi } from 'garmin-api-handler';
import { ActivityFilters } from 'garmin-api-handler/dist/GarminApi';
import { inject, injectable } from 'inversify';

@injectable()
export default class GarminService {
    public constructor(@inject(GarminApi) protected api: GarminApi) {}

    public getApi() {
        return this.api;
    }

    public async getActivity(id: number): Promise<Activity> {
        return this.api.getActivity(id);
    }

    public async getActivities(filters: ActivityFilters = {}): Promise<Activity[]> {
        return this.api.getActivities(filters);
    }

    public async createActivity(activity: Activity, gpx?: string) {
        if (gpx) {
            const activityId = await this.api.uploadGpx(gpx);
            return this.api.updateActivity(activity.setId(activityId));
        }

        return this.api.createActivity(activity);
    }

    public async getActivityGpx(id: number) {
        return this.api.getActivityGpx(id);
    }

    public async setGear(activityId: number, gear: string) {
        return this.api.addGear(activityId, gear);
    }
}
