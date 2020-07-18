import type { ApiToken } from 'fitbit-api-handler/dist/types/api/ApiToken';
import { inject, injectable } from 'inversify';
import { Storage } from 'storage-keeper';

@injectable()
export default class FitbitStorageService {
    private storageName = 'FITBIT_TOKEN';

    public constructor(@inject(Storage) private storage: Storage) {}

    public storeToken(token: ApiToken) {
        return this.storage.set(this.storageName, token);
    }

    public getToken() {
        return this.storage.get(this.storageName) as Promise<ApiToken | null>;
    }

    public deleteToken() {
        return this.storage.set(this.storageName, null);
    }
}
