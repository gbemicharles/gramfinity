const { Address } = require('@ton/ton');

const addr = Address.parse('EQD2LSa3mjAPEjRwrx8LP7w-hQyipRflXI39W0LSHBksypP4');

console.log("Bounceable URL-safe (default):", addr.toString({ bounceable: true, testOnly: false, urlSafe: true }));
console.log("Bounceable Non-URL-safe:", addr.toString({ bounceable: true, testOnly: false, urlSafe: false }));
console.log("Non-bounceable URL-safe:", addr.toString({ bounceable: false, testOnly: false, urlSafe: true }));
console.log("Raw hex:", addr.toRawString());
