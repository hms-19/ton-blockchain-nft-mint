import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4, TonClient, fromNano,internal, toNano } from "@ton/ton";

async function main() {
  const mnemonic = "cousin desert shove spoil away ignore day dynamic allow unveil earn define orphan assist escape thought cost opinion inside floor snack loan into floor";
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  const balance = await client.getBalance(wallet.address);
  console.log("balance:", fromNano(balance));

  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();
  console.log("seqno:", seqno);
  await walletContract.sendTransfer({
    secretKey: key.secretKey,
    seqno: seqno,
    messages: [
      internal({
        to: "UQBQTIPWlbTRjoaB5AqppwptZExwc4epJiFuMF_2aTDemfXN",
        value: toNano("0.05"), // 0.05 TON
        body: "Airdrop", // optional comment
        bounce: false,
      })
    ]
  });

  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("transaction confirmed!");
}

main();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}