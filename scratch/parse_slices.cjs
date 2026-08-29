const { TonClient, Address } = require('@ton/ton');

const client = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC'
});

const target = 'EQBMui5UvUCfxBvfGAhHkGexX3fshHiq-lRWfvNeqmYK-wmx';

async function main() {
  console.log(`Parsing get_wallet_data slices for: ${target}`);
  try {
    const result = await client.runMethod(Address.parse(target), 'get_wallet_data');
    
    // Standard layout: [balance (num), owner_address (slice), jetton_master_address (slice), jetton_wallet_code (cell)]
    const balanceItem = result.stack.items[0];
    const ownerItem = result.stack.items[1];
    const masterItem = result.stack.items[2];

    const balance = balanceItem.value;
    console.log(`Balance (raw): ${balance.toString()}`);

    if (ownerItem && (ownerItem.type === 'slice' || ownerItem.type === 'cell')) {
      const cell = ownerItem.type === 'slice' ? ownerItem.cell : ownerItem.cell;
      const slice = cell.beginParse();
      const addr = slice.loadAddress();
      console.log(`Owner Address: ${addr.toString({ bounceable: true, testOnly: false })}`);
    } else {
      console.log("Owner item is not a slice/cell:", ownerItem);
    }

    if (masterItem && (masterItem.type === 'slice' || masterItem.type === 'cell')) {
      const cell = masterItem.type === 'slice' ? masterItem.cell : masterItem.cell;
      const slice = cell.beginParse();
      const addr = slice.loadAddress();
      console.log(`Jetton Master (Token CA): ${addr.toString({ bounceable: true, testOnly: false })}`);
    } else {
      console.log("Master item is not a slice/cell:", masterItem);
    }

  } catch (e) {
    console.error("Error parsing slices:", e);
  }
}

main();
