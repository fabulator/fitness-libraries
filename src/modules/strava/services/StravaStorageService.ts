import { inject, injectable, named } from 'inversify';
import { Storage } from 'storage-keeper';
import TokenStorageService from '../../../TokenStorageService';
import { SYMBOLS } from '../constants';

@injectable()
export default class StravaStorageService extends TokenStorageService<any> {
    public constructor(
        @inject(Storage) storage: Storage,
        @inject(SYMBOLS.env) @named(SYMBOLS.apiStorageName) storageName: string,
    ) {
        super(storage, storageName);
    }
}
