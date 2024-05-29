import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/pump_nft.tact',
    options: {
        debug: true,
    },
};
