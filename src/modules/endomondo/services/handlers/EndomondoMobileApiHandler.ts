import { inject, injectable, named } from 'inversify';
import { MobileApi, EXCEPTIONS } from 'endomondo-api-handler';
import EndomondoMobileApiStorageService from '../storages/EndomondoMobileApiStorageService';
import { SYMBOLS } from '../../constants';

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

function reauth(): any {
    return (
        target: EndomondoMobileApiHandler,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...params: any[]) => Promise<any>>,
    ) => {
        const fn = descriptor.value;
        descriptor.value = async function (this: EndomondoMobileApiHandler, ...x) {
            try {
                // @ts-ignore
                return await fn.apply(this, x);
            } catch (exception) {
                if (exception instanceof EXCEPTIONS.EndomondoAuthException) {
                    await this.login();
                    // @ts-ignore
                    return fn.apply(this, x);
                }
                throw exception;
            }
        };
    };
}

@injectable()
class EndomondoMobileApiHandler extends MobileApi {
    public constructor(
        @inject(SYMBOLS.mobileApiStorage) public storage: EndomondoMobileApiStorageService,
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

    protected async auth() {
        if (this.getUserToken()) {
            return;
        }

        await this.login();
    }

    @reauth()
    public async getProfile(...parameters: ArgumentsType<typeof MobileApi.prototype.getProfile>) {
        await this.auth();
        return super.getProfile(...parameters);
    }

    @reauth()
    public async createWorkout(...parameters: ArgumentsType<typeof MobileApi.prototype.createWorkout>) {
        await this.auth();
        return super.createWorkout(...parameters);
    }

    @reauth()
    public async updateWorkout(...parameters: ArgumentsType<typeof MobileApi.prototype.updateWorkout>) {
        await this.auth();
        return super.updateWorkout(...parameters);
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

export default EndomondoMobileApiHandler;
