import "regenerator-runtime/runtime.js";
import * as nearAPI from "near-api-js";
import getConfig from "./config.js";
const nearConfig = getConfig("development");
let waiting = false

export default class Contract {

  near
  wallet_connection
  contract
  status
  provider

  async init() {
    
    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
    const PRIVATE_KEY =
      "2Eh5nAnYiPcHuAXAEP8rvDiXgXhyBzxpbPM3XP5acppYxTbVdQ3kQxvN5Rg1wnW5BecGDJdhKcLJdkbNFMCZwsV8";
    // creates a public / private key pair using the provided private key
    const keyPair = nearAPI.KeyPair.fromString(PRIVATE_KEY);
    // adds the keyPair you created to keyStore
    await keyStore.setKey("testnet", "bhc3.testnet", keyPair);

    this.near = await nearAPI.connect({
      keyStore: keyStore,
      // keyStore: new nearAPI.keyStores.UnencryptedFileSystemKeyStore("~/.near-credentials/testnet/bhc3.testnet.json"),
      ...nearConfig
    });

    const account = await this.near.account("bhc3.testnet");
    

    // Needed to access wallet login
    //this.wallet_connection = new nearAPI.WalletConnection(this.near);

    // Initializing our contract APIs by contract name and configuration.
    this.contract = await new nearAPI.Contract(account, nearConfig.contractName, {
        // View methods are read-only – they don't modify the state, but usually return some value
        viewMethods: ['get_status', 'get_round_status'],
        // Change methods can modify the state, but you don't receive the returned value when called
        changeMethods: ['bet', 'spin_wheel', 'deposit', 'withdraw', 'stake', 'unstake', 'harvest'],
        // Sender is the account ID to initialize transactions.
        // getAccountId() will return empty string if user is still unauthorized
        sender: account
    });
    this.provider = await new nearAPI.providers.JsonRpcProvider(nearConfig.nodeUrl);
  }

  async get_status() {
    let accountId = await this.get_account()
    this.status = await this.contract.get_status({sender: accountId})
    return this.status
  }

  async get_round_status() {
    return await this.contract.get_round_status()
  }

  async spin_wheel() {
    await this.contract.spin_wheel()
  }

}

async function init() {
    let contract = new Contract()
    await contract.init()
    setInterval(async () => {
      if (waiting) {
        return
      }
      waiting = true
      try {
        let round = await contract.get_round_status()
        console.log(round)
        if (round.next_round_block_index < round.current_block_index && round.bet_count > 0) {
            await contract.spin_wheel()
        }
      } catch {
        
      }
      waiting = false
    }, 1000)
}

init()

