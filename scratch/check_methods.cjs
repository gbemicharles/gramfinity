const { TonClient, Address } = require('@ton/ton');

const client = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC'
});

const target = 'EQBcKql_yYqsLO_NDXGxagjCM9PEoXN_-flIJpolzMSqBl5E';

async function main() {
  console.log(`Checking contract: ${target}`);
  
  // Try get_jetton_data (Jetton Master)
  try {
    const result = await client.runMethod(Address.parse(target), 'get_jetton_data');
    console.log("✅ get_jetton_data succeeded! It is a Jetton Master (Token contract).");
    console.log("Stack details:", result.stack);
    return;
  } catch (e) {
    console.log("❌ get_jetton_data failed:", e.message);
  }

  // Try get_wallet_data (Jetton Wallet)
  try {
    const result = await client.runMethod(Address.parse(target), 'get_wallet_data');
    console.log("✅ get_wallet_data succeeded! It is a Jetton Wallet (Balance contract).");
    console.log("Stack items count:", result.stack.items.length);
    result.stack.items.forEach((item, idx) => {
      console.log(`Item #${idx}: type=${item.type}`);
      if (item.type === 'cell') {
        console.log(`  Cell value (hex): ${item.cell.toString()}`);
      } else if (item.type === 'slice') {
        console.log(`  Slice cell (hex): ${item.cell.toString()}`);
      } else if (item.type === 'num') {
        console.log(`  Number value: ${item.value.toString()}`);
      }
    });
    return;
  } catch (e) {
    console.log("❌ get_wallet_data failed:", e.message);
  }
}

main();
