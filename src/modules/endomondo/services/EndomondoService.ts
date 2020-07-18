import { Api as EndomondoApi, MobileApi, Workout } from 'endomondo-api-handler';
import { WorkoutFilters } from 'endomondo-api-handler/src/types/WorkoutFilters';
import { inject, injectable } from 'inversify';
import { ArgumentsType } from '../../../utils';

@injectable()
class EndomondoService {
    public constructor(@inject(EndomondoApi) public api: EndomondoApi, @inject(MobileApi) public mobileApi: MobileApi) {}

    public getApi() {
        return this.api;
    }

    public getMobileApi() {
        return this.mobileApi;
    }

    public async getWorkout(id: number) {
        return this.api.getWorkout(id);
    }

    public async getWorkouts(filter: WorkoutFilters) {
        const { workouts } = await this.api.getWorkouts(filter);
        return workouts;
    }

    public async processWorkouts(...args: ArgumentsType<typeof EndomondoApi.prototype.processWorkouts>) {
        return this.api.processWorkouts(...args);
    }

    public async editWorkout(workout: Workout) {
        return this.api.editWorkout(workout);
    }

    public async createWorkout(workout: Workout) {
        const newWorkoutId = await this.mobileApi.createWorkout(workout);

        const newWorkout = workout.setId(newWorkoutId);

        newWorkout.getHashtags().forEach((hashtag) => {
            this.api.addHashtag(hashtag, newWorkoutId);
        });

        await this.api.editWorkout(newWorkout);

        return newWorkoutId;
    }

    public async getProfile() {
        return this.mobileApi.getProfile();
    }
}

export default EndomondoService;
