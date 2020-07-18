import { inject, injectable, named } from 'inversify';
import { Api, DefaultApiException } from 'rest-api-handler';
import { WebApi } from 'strava-api-handler';
import { ArgumentsType } from '../../../utils';
import { SYMBOLS } from '../constants';
import StravaWebStorageService from './StravaWebStorageService';

@injectable()
class StravaWebApiHandler extends WebApi {
    private init?: boolean;

    public constructor(
        @inject(StravaWebStorageService) public storage: StravaWebStorageService,
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

    public async request(...parameters: ArgumentsType<typeof Api.prototype.request>) {
        if (parameters[0].includes('login') || parameters[0].includes('session')) {
            return super.request(...parameters);
        }

        await this.sessionIni();

        if (!this.getSession()) {
            await this.login();
        }

        try {
            return await super.request(...parameters);
        } catch (exception) {
            if (exception instanceof DefaultApiException) {
                await this.login();
                return super.request(...parameters);
            }
            throw exception;
        }
    }

    public async login(email: string = this.email, password: string = this.password) {
        await super.login(email, password);
        await this.storage.store(this.getSession());
    }
}

export default StravaWebApiHandler;
