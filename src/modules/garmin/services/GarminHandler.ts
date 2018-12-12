import { inject, injectable, named } from 'inversify';
import { GarminApi, GarminApiException } from 'garmin-api-handler';
import GarminStorageService from './GarminStorageService';
import { SYMBOLS } from '../constants';

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

@injectable()
class GarminHandler extends GarminApi {
    public constructor(
        @inject(GarminStorageService) public storage: GarminStorageService,
        @inject(SYMBOLS.env) @named(SYMBOLS.login) public email: string,
        @inject(SYMBOLS.env) @named(SYMBOLS.password) public password: string,
    ) {
        super();

        const session = this.storage.get();

        if (!session) {
            return;
        }

        this.setSession(session);
    }

    public async login(email: string = this.email, password: string = this.password) {
        const response = await super.login(email, password);
        this.storage.store(response);
        return response;
    }

    public async request(...parameters: ArgumentsType<typeof GarminApi.prototype.request>) {
        if (parameters[0].includes('sso/login')) {
            return super.request(...parameters);
        }

        if (!this.getSession()) {
            await this.login();
        }

        try {
            return await super.request(...parameters);
        } catch (exception) {
            if (exception instanceof GarminApiException) {
                await this.login();
                return super.request(...parameters);
            }
            throw exception;
        }
    }
}

export default GarminHandler;
