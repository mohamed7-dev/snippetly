import { UTApi } from 'uploadthing/server';
import { BinaryStorageStrategy } from './binary-storage-strategy.interface';

interface UploadthingStrategyOptions {
    token: string;
}

export class UploadthingStrategy implements BinaryStorageStrategy {
    private utapi: UTApi;

    constructor(private options: UploadthingStrategyOptions) {}

    onInit(): void | Promise<void> {
        this.utapi = new UTApi({
            token: this.options.token,
        });
    }

    async upload(): Promise<void> {}
}
