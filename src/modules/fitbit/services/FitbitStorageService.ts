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
        return this.storage.set(this.storageName, token);
    }

    public getToken() {
        return this.storage.get(this.storageName) as Promise<TYPES.ApiToken | null>;
    }

    public deleteToken() {
        return this.storage.set(this.storageName, null);
    }
}
