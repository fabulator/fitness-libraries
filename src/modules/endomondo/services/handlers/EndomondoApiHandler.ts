import { Api as EndomondoApi, EXCEPTIONS } from 'endomondo-api-handler';
import { inject, injectable, named } from 'inversify';
import { ArgumentsType } from '../../../../utils';
import { SYMBOLS } from '../../constants';
import EndomondoApiStorageService from '../storages/EndomondoApiStorageService';

@injectable()
class EndomondoApiHandler extends EndomondoApi {
    private init?: boolean;

    public constructor(
        @inject(SYMBOLS.apiStorage) public storage: EndomondoApiStorageService,
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

        const { id, token } = session;

        if (id && token) {
            this.setUserToken(token);
            this.setUserId(id);
        }

        this.init = true;
    }

    public async getUserApiUrl(namespace: string, userId?: number) {
        if (!userId && !this.getUserId()) {
            await this.login(this.email, this.password);
        }

        return super.getUserApiUrl(namespace, userId || this.getUserId());
    }

    public async request(...parameters: ArgumentsType<typeof EndomondoApi.prototype.request>) {
        if (parameters[0].includes('rest/session')) {
            return super.request(...parameters);
        }

        await this.sessionIni();

        if (!this.getUserId()) {
            await this.login();
        }

        try {
            return await super.request(...parameters);
        } catch (exception) {
            if (exception instanceof EXCEPTIONS.EndomondoApiException) {
                await this.login();
                return super.request(...parameters);
            }
            throw exception;
        }
    }

    public async login(email: string = this.email, password: string = this.password) {
        const response = await super.login(email, password);

        const userId = this.getUserId();
        const userToken = this.getUserToken();

        if (!userId || !userToken) {
            throw new Error(`Endomondo login failed: ${JSON.stringify({ userId, userToken })}`);
        }

        this.storage.store({ id: userId, token: userToken });
        return response;
    }
}

export default EndomondoApiHandler;
