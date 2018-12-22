import { inject, injectable } from 'inversify';
import { TYPES } from 'fitbit-api-handler';
import { Storage } from 'storage-keeper';

@injectable()
export default class FitbitStorageService {
    private storageName = 'FITBIT_TOKEN';

    public constructor(
        @inject(Storage) private storage: Storage,
    ) {}

    public storeToken(token: TYPES.ApiToken) {
        this.storage.set(this.storageName, token);
    }

    public getToken(): TYPES.ApiToken | null {
        // @ts-ignore
        return this.storage.get(this.storageName);
    }

    public deleteToken() {
        this.storage.set(this.storageName, null);
    }
}
