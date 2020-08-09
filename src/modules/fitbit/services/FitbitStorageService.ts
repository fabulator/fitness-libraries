import type { ApiToken } from 'fitbit-api-handler/dist/types/api/ApiToken';
import { inject, injectable } from 'inversify';
import { Storage } from 'storage-keeper';
import TokenStorageService from '../../../TokenStorageService';

@injectable()
export default class FitbitStorageService extends TokenStorageService<ApiToken> {
    public constructor(@inject(Storage) storage: Storage, protected storageName: string) {
        super(storage, 'FITBIT_TOKEN');
    }
}
