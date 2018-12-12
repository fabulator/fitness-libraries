import { inject, injectable } from 'inversify';
import { Storage } from 'storage-keeper';

@injectable()
export default class TokenStorageService<Token = string> {
    public constructor(
        @inject(Storage) private storage: Storage,
        private storageName: string,
    ) {
    }

    public store(token: Token) {
        this.storage.set(this.storageName, token);
    }

    public get(): Token | null {
        // @ts-ignore
        return this.storage.get(this.storageName);
    }

    public delete() {
        this.storage.remove(this.storageName);
    }
}
