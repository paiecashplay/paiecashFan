const { ethers } = require('ethers');

async function check() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const txHash = '0x83f3a3539e16420f2eca884251ffd899791d70861c6eb9c8017ca17248f43bd7';
  
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) return;
  
  const pccInterface = new ethers.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ]);

  receipt.logs.forEach(log => {
    if (log.address.toLowerCase() === '0x1c013d6a523692b249a57529fc2da71256d17d5b') {
      try {
        const parsed = pccInterface.parseLog({ topics: [...log.topics], data: log.data });
        console.log(`PCC Transfer: From ${parsed.args.from} to ${parsed.args.to} amount ${ethers.formatUnits(parsed.args.value, 18)}`);
      } catch (e) {
        console.error("Could not parse log", e.message);
      }
    }
  });
}

check().catch(console.error);


