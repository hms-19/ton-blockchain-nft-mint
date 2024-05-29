import { toNano, Address } from '@ton/core';
import { PumpNft } from '../wrappers/PumpNft';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    let ownerAddress = Address.parse("0QAIqqtuGlob3JdjHAmkY3vGagPJwQZv8hoR-xnP7Hu41bAd");
    let nftMetadata: string = "https://bafybeihyfokmuix5mninrnql3tazxnx2iwuypgzv4iy2r6qiishlj2hpwe.ipfs.w3s.link/pump_nft_metadata.json";
    const pumpNft = provider.open(await PumpNft.fromInit(ownerAddress,nftMetadata,10n,1n));

    await pumpNft.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(pumpNft.address);

}
