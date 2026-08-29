const apiKey = 'AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI';
const wallet = 'EQD2LSa3mjAPEjRwrx8LP7w-hQyipRflXI39W0LSHBksypP4';

async function main() {
  console.log(`🔍 Fetching Jetton Wallet details from TonAPI for: ${wallet}...`);
  try {
    const response = await fetch(`https://tonapi.io/v2/accounts/${wallet}/jettons`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log("\n=== Jetton Wallet Decoded Info ===");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching Jetton wallet info:", error);
  }
}

main();
