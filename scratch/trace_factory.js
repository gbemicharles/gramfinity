const { Address } = require('@ton/ton');

const targetCA = 'EQAOWC7Er8gxWkMLsjIis8J3rZ-lFwJsP3mFGsdwCqU7pG_q';
const apiKey = 'AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI';

function formatAddress(rawStr) {
  if (!rawStr) return 'N/A';
  try {
    const addr = Address.parse(rawStr);
    return addr.toString({ bounceable: true, testOnly: false });
  } catch (e) {
    return rawStr;
  }
}

async function main() {
  console.log(`🔍 Fetching transactions for account: ${targetCA}...`);
  try {
    const response = await fetch(`https://tonapi.io/v2/blockchain/accounts/${targetCA}/transactions?limit=20`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`Found ${data.transactions?.length || 0} transactions.`);

    if (!data.transactions || data.transactions.length === 0) {
      console.log("No transactions found.");
      return;
    }

    // Sort transactions oldest to newest to find the creation transaction
    const sorted = [...data.transactions].sort((a, b) => a.utime - b.utime);
    const creationTx = sorted[0];

    console.log("\n--- Genesis / Creation Transaction ---");
    console.log(`Hash: ${creationTx.hash}`);
    console.log(`Time: ${new Date(creationTx.utime * 1000).toISOString()}`);
    console.log(`In Message:`);
    if (creationTx.in_msg) {
      const sourceRaw = creationTx.in_msg.source?.address;
      const destRaw = creationTx.in_msg.destination?.address;
      
      console.log(`  Source (Possible Factory) Raw: ${sourceRaw || 'N/A'}`);
      console.log(`  Source (Possible Factory) Standard: ${formatAddress(sourceRaw)}`);
      console.log(`  Destination Standard: ${formatAddress(destRaw)}`);
      console.log(`  Value: ${creationTx.in_msg.value || 0} nanoTON (${(creationTx.in_msg.value / 1e9).toFixed(4)} TON)`);
      console.log(`  Opcode: ${creationTx.in_msg.op_code || 'N/A'}`);
    } else {
      console.log("No in_msg found.");
    }
  } catch (error) {
    console.error("Error tracing factory address:", error);
  }
}

main();
