/**
 * Utilitaire de chiffrement AES-256 pour données sensibles
 * Conforme aux best practices WalletConnect
 * https://docs.walletconnect.network/wallet-sdk/best-practices
 */

const CryptoJS = require('crypto-js');
const crypto = require('crypto');

// Vérification de la clé de chiffrement
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY doit être définie et faire exactement 32 caractères (256 bits)');
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

/**
 * Chiffre une donnée avec AES-256-CBC
 * @param {string} plaintext - Texte en clair à chiffrer
 * @returns {string} - Texte chiffré en format base64
 */
const encrypt = (plaintext) => {
  try {
    if (!plaintext) {
      throw new Error('Le texte à chiffrer ne peut pas être vide');
    }

    // Génération d'un IV (Initialization Vector) aléatoire unique pour chaque chiffrement
    const iv = crypto.randomBytes(16);

    // Création du cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'utf-8'),
      iv
    );

    // Chiffrement
    let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    // Retour au format: IV:encrypted (séparés par ':')
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Erreur lors du chiffrement: ${error.message}`);
  }
};

/**
 * Déchiffre une donnée chiffrée avec AES-256-CBC
 * @param {string} ciphertext - Texte chiffré au format IV:encrypted
 * @returns {string} - Texte déchiffré
 */
const decrypt = (ciphertext) => {
  try {
    if (!ciphertext) {
      throw new Error('Le texte à déchiffrer ne peut pas être vide');
    }

    // Séparation de l'IV et du texte chiffré
    const parts = ciphertext.split(':');
    if (parts.length !== 2) {
      throw new Error('Format de texte chiffré invalide');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    // Création du decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'utf-8'),
      iv
    );

    // Déchiffrement
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    throw new Error(`Erreur lors du déchiffrement: ${error.message}`);
  }
};

/**
 * Hash une donnée avec SHA-256 (pour comparaison, non réversible)
 * @param {string} data - Donnée à hasher
 * @returns {string} - Hash en hexadécimal
 */
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Génère un token aléatoire sécurisé
 * @param {number} length - Longueur du token en bytes (défaut: 32)
 * @returns {string} - Token en hexadécimal
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Chiffre une clé privée Ethereum (pour wallet custodial)
 * Attention: Les wallets non-custodial (WalletConnect) ne stockent JAMAIS la clé privée côté serveur
 * @param {string} privateKey - Clé privée à chiffrer
 * @returns {string} - Clé privée chiffrée
 */
const encryptPrivateKey = (privateKey) => {
  // Validation du format de clé privée Ethereum (64 caractères hexadécimaux)
  if (!/^[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error('Format de clé privée Ethereum invalide');
  }
  return encrypt(privateKey);
};

/**
 * Déchiffre une clé privée Ethereum
 * @param {string} encryptedPrivateKey - Clé privée chiffrée
 * @returns {string} - Clé privée en clair
 */
const decryptPrivateKey = (encryptedPrivateKey) => {
  return decrypt(encryptedPrivateKey);
};

/**
 * Chiffre un code de paiement (6 chiffres)
 * @param {string} paymentCode - Code de paiement (ex: "123456")
 * @returns {string} - Code chiffré
 */
const encryptPaymentCode = (paymentCode) => {
  // Validation: 6 chiffres exactement
  if (!/^\d{6}$/.test(paymentCode)) {
    throw new Error('Le code de paiement doit contenir exactement 6 chiffres');
  }
  return encrypt(paymentCode);
};

/**
 * Déchiffre un code de paiement
 * @param {string} encryptedCode - Code chiffré
 * @returns {string} - Code en clair (6 chiffres)
 */
const decryptPaymentCode = (encryptedCode) => {
  return decrypt(encryptedCode);
};

/**
 * Chiffre un numéro de carte bancaire
 * @param {string} cardNumber - Numéro de carte (16 chiffres)
 * @returns {string} - Numéro chiffré
 */
const encryptCardNumber = (cardNumber) => {
  // Validation: 16 chiffres (format standard Mastercard/Visa)
  if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
    throw new Error('Le numéro de carte doit contenir exactement 16 chiffres');
  }
  return encrypt(cardNumber);
};

/**
 * Déchiffre un numéro de carte bancaire
 * @param {string} encryptedCardNumber - Numéro chiffré
 * @returns {string} - Numéro en clair
 */
const decryptCardNumber = (encryptedCardNumber) => {
  return decrypt(encryptedCardNumber);
};

/**
 * Masque un numéro de carte pour affichage sécurisé
 * @param {string} cardNumber - Numéro de carte complet
 * @returns {string} - Numéro masqué (ex: "**** **** **** 1234")
 */
const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length !== 16) {
    return '****';
  }
  return `**** **** **** ${cleaned.slice(-4)}`;
};

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateToken,
  encryptPrivateKey,
  decryptPrivateKey,
  encryptPaymentCode,
  decryptPaymentCode,
  encryptCardNumber,
  decryptCardNumber,
  maskCardNumber
};
