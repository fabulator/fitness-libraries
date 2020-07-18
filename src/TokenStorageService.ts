import { inject, injectable } from 'inversify';
import { Storage } from 'storage-keeper';

@injectable()
export default class TokenStorageService<Token = string> {
    public constructor(@inject(Storage) private storage: Storage, private storageName: string) {}

    public async store(token: Token) {
        return this.storage.set(this.storageName, token);
    }

    public async get() {
        return (this.storage.get(this.storageName) as unknown) as Token | null;
    }

    public async delete() {
        return this.storage.remove(this.storageName);
    }
}
