import { inject, injectable, named } from 'inversify';
import { Storage } from 'storage-keeper';
import TokenStorageService from '../../../../TokenStorageService';
import { SYMBOLS } from '../../constants';
import { EndomondoToken } from './EndomondoStorageService';

@injectable()
class EndomondoMobileApiStorageService extends TokenStorageService<EndomondoToken> {
    public constructor(@inject(Storage) storage: Storage, @inject(SYMBOLS.env) @named(SYMBOLS.mobileApiStorageName) storageName: string) {
        super(storage, storageName);
    }
}

export default EndomondoMobileApiStorageService;
