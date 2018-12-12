import { inject, injectable, named } from 'inversify';
import { Api as EndomondoApi, EXCEPTIONS } from 'endomondo-api-handler';
import EndomondoApiStorageService from '../storages/EndomondoApiStorageService';
import { SYMBOLS } from '../../constants';

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

@injectable()
class EndomondoApiHandler extends EndomondoApi {
    public constructor(
        @inject(SYMBOLS.apiStorage) public storage: EndomondoApiStorageService,
        @inject(SYMBOLS.env) @named(SYMBOLS.login) public email: string,
        @inject(SYMBOLS.env) @named(SYMBOLS.password) public password: string,
    ) {
        super();

        const session = this.storage.get();

        if (!session) {
            return;
        }

        const { id, token } = session;

        if (id && token) {
            this.setUserToken(token);
            this.setUserId(id);
        }
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
