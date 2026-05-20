const { CircleDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const forge = require('node-forge');
require('dotenv').config();

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

if (!apiKey || !entitySecret) {
  console.error("ERROR: CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set in .env");
  process.exit(1);
}

const dcwClient = new CircleDeveloperControlledWalletsClient(apiKey, entitySecret);

async function generateCiphertext() {
  try {
    console.log("Fetching public key from Circle...");
    const pubKeyRes = await dcwClient.getPublicKey();
    const publicKeyStr = pubKeyRes.data.publicKey;
    
    console.log("Public key fetched successfully. Encrypting Entity Secret...");
    
    // Encrypt the 32-byte hex entity secret using RSA-OAEP with SHA-256
    const entitySecretBuffer = forge.util.createBuffer(forge.util.hexToBytes(entitySecret));
    const publicKey = forge.pki.publicKeyFromPem(publicKeyStr);
    
    const encryptedData = publicKey.encrypt(entitySecretBuffer.getBytes(), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    });
    
    const ciphertext = forge.util.encode64(encryptedData);
    
    console.log("\n══════════════════════════════════════════════════════════════");
    console.log("YOUR CIPHERTEXT (Copy everything below):");
    console.log("══════════════════════════════════════════════════════════════\n");
    console.log(ciphertext);
    console.log("\n══════════════════════════════════════════════════════════════");
    console.log("NEXT STEPS:");
    console.log("1. Log in to your Circle Developer Console: https://console.circle.com");
    console.log("2. Navigate to Developer > Wallets > Developer-Controlled");
    console.log("3. Click 'Register Entity Secret' and paste the ciphertext above.");
    console.log("4. Once registered, you can run the setup script!");
  } catch (err) {
    console.error("Error generating ciphertext:", err.response?.data || err.message);
  }
}

generateCiphertext();
