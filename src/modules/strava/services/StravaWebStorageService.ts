import { inject, injectable, named } from 'inversify';
import { Storage } from 'storage-keeper';
import TokenStorageService from '../../../TokenStorageService';
import { SYMBOLS } from '../constants';

@injectable()
export default class StravaWebStorageService extends TokenStorageService<any> {
    public constructor(@inject(Storage) storage: Storage, @inject(SYMBOLS.env) @named(SYMBOLS.webApiStorageName) storageName: string) {
        super(storage, storageName);
    }
}
