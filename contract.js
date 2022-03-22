import * as nearAPI from "near-api-js";
import getConfig from "./config.js";
import getSecret from "./secret.js"

const nearConfig = getConfig();
const secret = getSecret()

class Contract {

    near
    wallet_connection
    contract
    status
    provider
  
    async init() {
      
      const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
      const keyPair = nearAPI.KeyPair.fromString(secret.private_key);
      await keyStore.setKey(nearConfig.networkId, nearConfig.contractName, keyPair);
  
      this.near = await nearAPI.connect({
        keyStore: keyStore,
        ...nearConfig
      });
  
      const account = await this.near.account(nearConfig.contractName);
      
  
      // Needed to access wallet login
      //this.wallet_connection = new nearAPI.WalletConnection(this.near);
  
      // Initializing our contract APIs by contract name and configuration.
      this.contract = await new nearAPI.Contract(account, nearConfig.contractName, {
          // View methods are read-only – they don't modify the state, but usually return some value
          viewMethods: ['get_contract_status', 'get_round_status'],
          // Change methods can modify the state, but you don't receive the returned value when called
          changeMethods: ['spin_wheel', ],
          // Sender is the account ID to initialize transactions.
          // getAccountId() will return empty string if user is still unauthorized
          sender: account
      });
      this.provider = await new nearAPI.providers.JsonRpcProvider(nearConfig.nodeUrl);
    }
  
    async get_round_status() {
      return await this.contract.get_round_status()
    }

    async get_contract_status() {
        await this.contract.get_contract_status()
    }
  
    async spin_wheel() {
      await this.contract.spin_wheel()
    }
  
  }

  export default new Contract()