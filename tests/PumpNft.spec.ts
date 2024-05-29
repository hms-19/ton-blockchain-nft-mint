import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano, Address } from '@ton/core';
import { MsMint, PumpNft } from '../wrappers/PumpNft';
import '@ton/test-utils';

describe('PumpNft', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let pumpNft: SandboxContract<PumpNft>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        let ownerAddress = Address.parse("EQDC7Ki5NHb_myFoONF5q93EnU3XaR3_cnksz6JOoB3KnHVP");
        let nftMetadata: string = "https://bafybeihyfokmuix5mninrnql3tazxnx2iwuypgzv4iy2r6qiishlj2hpwe.ipfs.w3s.link/pump_nft_metadata.json";
        pumpNft = blockchain.openContract(await PumpNft.fromInit(ownerAddress, nftMetadata, 10n,1n));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await pumpNft.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: pumpNft.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and pumpNft are ready to use
    });

    it('should mint nft', async () => {
        const quantity: bigint = 2n;
        const message: MsMint = {
          $$type: 'MsMint',
          quantity: quantity
        };
      
        const initialTotalSupply = await pumpNft.getTotalSupply(); // Assuming a getTotalSupply function
      
        const res = await pumpNft.send(deployer.getSender(), {
          value: toNano("2")
        }, message);
        
        console.log(res)
        
        const finalTotalSupply = await pumpNft.getTotalSupply();
        expect(finalTotalSupply).toBeGreaterThan(initialTotalSupply); // Verify total supply increase
    });

    // it("get total supply", async () => {
    //     const totalSupply = await pumpNft.getTotalSupply();
    //     console.log("totalSupply:",totalSupply.toLocaleString())
    // })

    // it("get contract balance", async () => {
    //     const contractBalance = await pumpNft.getContractBalance();
    //     console.log("contractBalance:",contractBalance.toLocaleString())
    // })

});
