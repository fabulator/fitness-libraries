import TokenStorageService from '../../../../TokenStorageService';

export type EndomondoToken = { id: number, token: string };

export type EndomondoStorageService = TokenStorageService<EndomondoToken>;
