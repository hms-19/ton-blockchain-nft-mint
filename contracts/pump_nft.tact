import "@stdlib/deploy";
import "@stdlib/ownable";

message MsMaxSupply {
    new_max_supply: Int; 
}

message MsMint {
    quantity: Int;
}


contract PumpNft with Deployable, Ownable {

    owner: Address;
    next_item_index: Int as uint32 = 0;
    fees: Int as uint32 = 1;
    max_supply: Int as uint32;  
    baseURL: String;
    contractBalance: Int as uint32;
    tokenOwners: map<Int, Address>;

    init(
        owner: Address,
        baseURL: String,
        max_supply: Int,
        fees: Int
    ) {
        self.owner = owner;
        self.baseURL = baseURL;
        self.max_supply = max_supply;  
        self.contractBalance = 0;
        self.fees = fees;
    }

    receive(msg: MsMint) {
        let mintingFee: Int = self.fees * msg.quantity;
        let ctx: Context = context(); 
        let msgValue: Int = ctx.value;
        
        require(msgValue >= mintingFee, "Insufficient funds to cover fees");
        require(self.next_item_index < self.max_supply, "Maximum supply reached");

        self.contractBalance += mintingFee;
        
        repeat (msg.quantity) {  
            let tokenId: Int = self.mint(ctx.sender);
            self.tokenOwners.set(tokenId,ctx.sender);
        }

    }

    fun mint(sender: Address) : Int {
        require(self.next_item_index >= 0, "non-sequential NFTs");
        
        let tokenId: Int = self.next_item_index;
        self.next_item_index = self.next_item_index + 1;
        
        return tokenId;
    }

    get fun ownerByTokenId(tokenId: Int): Address {
        require(tokenId >= 0 && tokenId < self.next_item_index, "Invalid token ID");
        let ownerAddress: Address = self.tokenOwners.get(tokenId)!!;

        return ownerAddress;
    }

    get fun nftMetadata(): String {
        return self.baseURL;
    }

    get fun totalSupply(): Int {
        return self.next_item_index;
    }

    get fun contractBalance(): Int {
        return self.contractBalance;
    }

    receive("withdraw") {
        let ctx: Context = context(); 
        self.withdrawBalance(ctx.sender);
    }

    fun withdrawBalance(sender: Address) {
        require(sender == self.owner, "Only the contract owner can withdraw funds");
        
        send(SendParameters {
            to: self.owner,
            value: self.contractBalance,
            bounce: false,
            body: "Withdraw".asComment()
        });

        self.contractBalance = 0;
    }

}
