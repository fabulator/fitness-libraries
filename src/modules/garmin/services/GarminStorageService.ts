import { inject, injectable, named } from 'inversify';
import { Storage } from 'storage-keeper';
import TokenStorageService from '../../../TokenStorageService';
import { SYMBOLS } from '../constants';

@injectable()
class GarminStorageService extends TokenStorageService<string> {
    public constructor(
        @inject(Storage) storage: Storage,
        @inject(SYMBOLS.env) @named(SYMBOLS.apiStorageName) storageName: string,
        @inject(SYMBOLS.env) @named(SYMBOLS.login) email: string,
    ) {
        super(storage, `${storageName}${email}`);
    }
}

export default GarminStorageService;
