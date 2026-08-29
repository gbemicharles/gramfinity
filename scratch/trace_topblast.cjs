const { Address } = require('@ton/ton');

const topblastMaster = 'EQAmkd4Pd_xgUW4b9MLrygf0SOfR2EUVa_iCtVWGnYB2hItG';
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
  console.log(`🔍 Fetching transactions for TopBlast Master: ${topblastMaster}...`);
  try {
    const response = await fetch(`https://tonapi.io/v2/blockchain/accounts/${topblastMaster}/transactions?limit=25`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`Found ${data.transactions?.length || 0} transactions.`);

    data.transactions.forEach((tx, idx) => {
      console.log(`\n--- Transaction #${idx + 1} ---`);
      console.log(`Hash: ${tx.hash}`);
      console.log(`Time: ${new Date(tx.utime * 1000).toISOString()}`);
      if (tx.in_msg) {
        console.log(`In MSG Source: ${formatAddress(tx.in_msg.source?.address)}`);
        console.log(`In MSG Dest: ${formatAddress(tx.in_msg.destination?.address)}`);
        console.log(`In MSG Opcode: ${tx.in_msg.op_code || 'N/A'}`);
      }
      if (tx.out_msgs && tx.out_msgs.length > 0) {
        console.log("Out Messages:");
        tx.out_msgs.forEach((out, oIdx) => {
          console.log(`  [${oIdx}] Dest: ${formatAddress(out.destination?.address)}`);
          console.log(`  [${oIdx}] Value: ${(out.value / 1e9).toFixed(4)} TON`);
          console.log(`  [${oIdx}] Opcode: ${out.op_code || 'N/A'}`);
        });
      }
    });
  } catch (error) {
    console.error("Error tracing TopBlast master:", error);
  }
}

main();
