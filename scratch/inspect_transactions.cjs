const apiKey = 'AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI';
const target = 'EQAmTDBEcOvTfakgld4aNsa8VWidZtGiN6wTJW5PWkBJa3Pp';

async function main() {
  console.log(`🔍 Fetching transactions for contract: ${target}...`);
  try {
    const response = await fetch(`https://tonapi.io/v2/blockchain/accounts/${target}/transactions?limit=20`, {
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
      console.log(`\n--- Tx #${idx + 1} ---`);
      console.log(`Hash: ${tx.hash}`);
      console.log(`Time: ${new Date(tx.utime * 1000).toISOString()}`);
      
      if (tx.in_msg) {
        console.log(`In Msg Opcode: ${tx.in_msg.op_code || 'N/A'}`);
        if (tx.in_msg.decoded_body) {
          console.log(`In Msg Decoded Body:`, JSON.stringify(tx.in_msg.decoded_body, null, 2));
        }
        // Check if there is a comment text
        if (tx.in_msg.decoded_body && tx.in_msg.decoded_body.text) {
          console.log(`Comment: "${tx.in_msg.decoded_body.text}"`);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
}

main();
