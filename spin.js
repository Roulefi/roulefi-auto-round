import wampApi from "./wamp/api.js";
import contract from "./contract.js"

let roundStatus = {}
let spinning = false

const handler = async (value) => {
  console.log(value.latestBlockHeight)
  if (spinning) {
    return
  }
  try {
    if (roundStatus.next_round_block_index < Number(value.latestBlockHeight)) {
      let newRoundStatus = await contract.get_round_status()
      if (newRoundStatus.bet_count > 0) {
        spinning = true
        await contract.spin_wheel(roundStatus.round_index)
        spinning = false
        roundStatus = await contract.get_round_status()
      }
    }
  } catch (e) {
    console.log(e)
  }
  
}

async function run() {
  wampApi.subscribe("chain-blocks-stats", handler)
}

async function init() {
    await contract.init()
    roundStatus = await contract.get_round_status()
    run()
}

init()

