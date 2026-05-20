const { ethers } = require('ethers');

async function check() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const txHash = '0x83f3a3539e16420f2eca884251ffd899791d70861c6eb9c8017ca17248f43bd7';
  
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    console.log('Transaction not found on chain!');
    return;
  }
  
  console.log(`Status: ${receipt.status === 1 ? 'SUCCESS' : 'REVERTED'}`);
  console.log(`Logs count: ${receipt.logs.length}`);
  
  receipt.logs.forEach((log, i) => {
    console.log(`Log ${i}: Address: ${log.address}, Topic0: ${log.topics[0]}`);
  });
}

check().catch(console.error);
