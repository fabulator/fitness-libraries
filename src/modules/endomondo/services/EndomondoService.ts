import { inject, injectable } from 'inversify';
import {
    Api as EndomondoApi, MobileApi, Workout, TYPES,
} from 'endomondo-api-handler';

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

@injectable()
class EndomondoService {
    public constructor(
        @inject(EndomondoApi) public api: EndomondoApi,
        @inject(MobileApi) public mobileApi: MobileApi,
    ) {}

    public async getWorkout(id: number) {
        return this.api.getWorkout(id);
    }

    public async getWorkouts(filter: TYPES.WorkoutFilters) {
        const { workouts } = await this.api.getWorkouts(filter);
        return workouts;
    }

    public async processWorkouts(...args: ArgumentsType<typeof EndomondoApi.prototype.processWorkouts>) {
        return this.api.processWorkouts(...args);
    }

    public async createWorkout(workout: Workout) {
        return this.mobileApi.createWorkout(workout);
    }

    public async getProfile() {
        return this.mobileApi.getProfile();
    }
}

export default EndomondoService;
