import { GarminApi, GarminApiException } from 'garmin-api-handler';
import { inject, injectable, named } from 'inversify';
import { SYMBOLS } from '../constants';
import GarminStorageService from './GarminStorageService';
import { ArgumentsType } from '../../../utils';

@injectable()
class GarminHandler extends GarminApi {
    private init?: boolean;

    public constructor(
        @inject(GarminStorageService) public storage: GarminStorageService,
        @inject(SYMBOLS.env) @named(SYMBOLS.login) public email: string,
        @inject(SYMBOLS.env) @named(SYMBOLS.password) public password: string,
    ) {
        super();
    }

    private async sessionIni() {
        if (this.init) {
            return;
        }

        const session = await this.storage.get();

        if (!session) {
            return;
        }

        this.setSession(session);

        this.init = true;
    }

    public async login(email: string = this.email, password: string = this.password) {
        const response = await super.login(email, password);
        await this.storage.store(response);
        return response;
    }

    public async request(...parameters: ArgumentsType<typeof GarminApi.prototype.request>) {
        if (
            parameters[0].includes('sso/login') ||
            parameters[0].includes('ticket') ||
            parameters[0] === 'https://connect.garmin.com/modern/'
        ) {
            return super.request(...parameters);
        }

        await this.sessionIni();

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
