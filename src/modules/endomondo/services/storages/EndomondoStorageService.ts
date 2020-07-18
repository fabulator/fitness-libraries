import TokenStorageService from '../../../../TokenStorageService';

export interface EndomondoToken {
    id: number;
    token: string;
}

export type EndomondoStorageService = TokenStorageService<EndomondoToken>;
