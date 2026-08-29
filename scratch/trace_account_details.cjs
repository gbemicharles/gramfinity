const apiKey = 'AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI';
const target = 'EQDTQAHDACbCALCVECg1NTDjDQVQRAYREMcFH7Hy4sMN-kt9';

async function main() {
  console.log(`🔍 Fetching details for contract: ${target}...`);
  try {
    const response = await fetch(`https://tonapi.io/v2/blockchain/accounts/${target}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log("\n=== Account Details ===");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching account details:", error);
  }
}

main();
