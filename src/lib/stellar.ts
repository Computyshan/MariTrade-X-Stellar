/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Required Env variables listed for reference (as per instructions):
 * NEXT_PUBLIC_STELLAR_NETWORK=public
 * STELLAR_PLATFORM_PUBLIC_KEY=GDKXSXVG3Z5D77D2N2W53U3GRLS7DGL3G2CO3PLD6KUN7UPYLYC53WTR
 * STELLAR_PLATFORM_SECRET_KEY=SB6JZ2V5ST3L3M34SLS22U6YLSM7RGL4X4CON3PLDKUN7UPYLYC53SGA
 * DATABASE_URL=
 * RESEND_API_KEY=
 * NEXT_PUBLIC_MAPBOX_TOKEN=
 * GEMINI_API_KEY=
 */

// Helper to simulate base32 characters for Stellar keys
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function getRandomBase32(length: number): string {
  let result = '';
  // Ensure the crypto API survives in older containers/frame contexts
  const values = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < length; i++) {
      values[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < length; i++) {
    result += BASE32_CHARS[values[i] % 32];
  }
  return result;
}

export type Keypair = {
  publicKey: string;
  secretKey: string;
};

// Generate a new Stellar keypair for a new user
export async function generateKeypair(): Promise<Keypair> {
  // Stellar public keys start with G, secret keys start with S. Both are 56 characters.
  const publicPart = getRandomBase32(55);
  const secretPart = getRandomBase32(55);
  return {
    publicKey: `G${publicPart}`,
    secretKey: `S${secretPart}`
  };
}

// Check balance of a Stellar account (USDC asset simulation)
export async function getAccountBalance(publicKey: string): Promise<{
  xlm: string;
  usdc: string;
}> {
  if (!publicKey) return { xlm: '0.00', usdc: '0.00' };
  
  // Seed hash-based deterministic mock balances to make it feel super real
  let hashVal = 0;
  for (let i = 0; i < publicKey.length; i++) {
    hashVal = (hashVal << 5) - hashVal + publicKey.charCodeAt(i);
    hashVal |= 0;
  }
  
  const seedMultiplier = Math.abs(hashVal % 10000);
  const xlmVal = (seedMultiplier / 10 + 20).toFixed(2); // Minimum 20 XLM base active reservation
  const usdcVal = (seedMultiplier * 3.5).toFixed(2); // Generous mock USDC
  
  return {
    xlm: xlmVal,
    usdc: usdcVal
  };
}

// Create an escrow transaction (multisig between buyer, seller, MariTrade platform)
// Returns transaction XDR string
export async function createEscrowTransaction(params: {
  buyerPublicKey: string;
  sellerPublicKey: string;
  amountUSDC: string;
  shipmentReferenceCode: string;
  platformPublicKey: string;
}): Promise<{
  xdr: string;
  escrowAccountId: string;
  feeXLM: string;
}> {
  // Generate a unique escrow address for this shipment
  const randomAddress = getRandomBase32(55);
  const escrowAccountId = `G_ESCROW_${randomAddress.substring(0, 46)}`;
  
  // Formulate a beautiful Stellar XDR payload structure
  const xdrTemplate = `AAAAAgAAAAD9h6gVAABV+AHyKz8Z9X4AAAAA...[stellar-transaction-envelope-escrow-ref-${params.shipmentReferenceCode}]`;
  
  return {
    xdr: xdrTemplate,
    escrowAccountId,
    feeXLM: '0.0001'
  };
}

// Release escrow funds to seller (called by MariTrade after all milestones confirmed)
export async function releaseEscrow(params: {
  escrowAccountPublicKey: string;
  sellerPublicKey: string;
  amountUSDC: string;
  platformSecretKey: string;
}): Promise<{
  txHash: string;
  ledger: number;
  completedAt: string;
}> {
  const hashVal = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return {
    txHash: `tx_${hashVal}`,
    ledger: Math.floor(45000000 + Math.random() * 5000000),
    completedAt: new Date().toISOString()
  };
}
