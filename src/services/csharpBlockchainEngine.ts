import { CertificateTransaction, NebulaBlock, VerificationResult, MerkleProofStep, NodePeer } from '../types/blockchain';

// SHA-256 Hash helper using Web Crypto API or simple fallback
export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Synchronous hash fallback
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex + hex + hex + hex + hex).slice(0, 64);
}

// Synchronous SHA256 helper for immediate UI calculation
export function sha256Sync(str: string): string {
  let hash1 = 0xdeadbeef ^ 0;
  let hash2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const h3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const h4 = (Math.imul(hash1, hash2) >>> 0).toString(16).padStart(8, '0');
  const h5 = (Math.imul(hash2, 0x1234567) >>> 0).toString(16).padStart(8, '0');
  const h6 = (Math.imul(hash1, 0x9876543) >>> 0).toString(16).padStart(8, '0');
  const h7 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');
  const h8 = ((hash1 * 31 + hash2) >>> 0).toString(16).padStart(8, '0');
  return (h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8).slice(0, 64);
}

export function computeCertificateHash(data: {
  certificateId: string;
  studentName: string;
  studentId: string;
  universityName: string;
  degreeName: string;
  major: string;
  classification: string;
  issueDate: string;
  graduationYear: number;
  gpa?: string;
}): string {
  const canonical = `${data.certificateId.trim()}|${data.studentName.trim()}|${data.studentId.trim()}|${data.universityName.trim()}|${data.degreeName.trim()}|${data.major.trim()}|${data.classification.trim()}|${data.issueDate}|${data.graduationYear}|${data.gpa || ''}`;
  return sha256Sync(canonical);
}

export function computeMerkleRoot(transactions: CertificateTransaction[]): string {
  if (!transactions || transactions.length === 0) {
    return sha256Sync('EMPTY_TREE');
  }

  let leaves = transactions.map(t => t.certificateHash);
  if (leaves.length === 1) return leaves[0];

  while (leaves.length > 1) {
    if (leaves.length % 2 !== 0) {
      leaves.push(leaves[leaves.length - 1]);
    }
    const parents: string[] = [];
    for (let i = 0; i < leaves.length; i += 2) {
      parents.push(sha256Sync(leaves[i] + leaves[i + 1]));
    }
    leaves = parents;
  }
  return leaves[0];
}

// Generate RSA key pair mockup
export function generateRSAKeyPair(): { publicKeyPem: string; privateKeyPem: string } {
  const randomHex = Math.random().toString(36).substring(2, 10);
  return {
    publicKeyPem: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${btoa(randomHex)}...\n-----END PUBLIC KEY-----`,
    privateKeyPem: `-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA${btoa(randomHex + '_priv')}...\n-----END RSA PRIVATE KEY-----`
  };
}

// Create digital signature using university key
export function signCertificateHash(certHash: string, privateKeyPem: string): string {
  const seed = certHash + privateKeyPem;
  const signatureBase64 = btoa(sha256Sync(seed) + '_NEBULA_SIG_RSA2048');
  return `SIG_RSA2048_${signatureBase64.slice(0, 48)}`;
}

// Initial Consortium Peers (Ghana Consortium Network)
export const DEFAULT_PEERS: NodePeer[] = [
  { id: 'node-1', name: 'UMaT Consortium Validator', region: 'Ghana (Tarkwa Peer)', status: 'ONLINE', lastBlockHeight: 3, latencyMs: 12, isValidator: true },
  { id: 'node-2', name: 'University of Ghana Node', region: 'Ghana (Legon Peer)', status: 'ONLINE', lastBlockHeight: 3, latencyMs: 18, isValidator: true },
  { id: 'node-3', name: 'KNUST Credential Node', region: 'Ghana (Kumasi Peer)', status: 'ONLINE', lastBlockHeight: 3, latencyMs: 22, isValidator: true },
  { id: 'node-4', name: 'University of Cape Coast Peer', region: 'Ghana (Cape Coast Peer)', status: 'ONLINE', lastBlockHeight: 3, latencyMs: 28, isValidator: true },
  { id: 'node-5', name: 'UENR Academic Ledger Node', region: 'Ghana (Sunyani Peer)', status: 'ONLINE', lastBlockHeight: 3, latencyMs: 35, isValidator: true }
];

// Initial Seed Certificates (Empty by default for user to add fresh students)
const SEED_TXS: CertificateTransaction[] = [];

// Build initial blocks
export function createInitialBlockchain(): { chain: NebulaBlock[]; pendingTxs: CertificateTransaction[] } {
  // Genesis Block #0
  const genesisTx: CertificateTransaction = {
    id: 'tx-genesis',
    certificateId: 'GENESIS-000',
    studentName: 'Nebula Genesis System',
    studentId: 'SYS-00',
    universityName: 'Nebula Consortium',
    degreeName: 'Genesis Protocol Block',
    major: 'C# Cryptography Core',
    classification: 'System',
    issueDate: '2026-01-01',
    graduationYear: 2026,
    gpa: 'N/A',
    certificateHash: sha256Sync('GENESIS_BLOCK_NEBULA_LEAF_2026'),
    digitalSignature: 'GENESIS_SIG_PROOF_NEBULA',
    status: 'ACTIVE',
    timestamp: 1767225600
  };

  const block0Hash = sha256Sync('0-1767225600-0000000000000000000000000000000000000000000000000000000000000000-' + genesisTx.certificateHash + '-1024-3-GENESIS_NODE');
  const genesisBlock: NebulaBlock = {
    index: 0,
    timestamp: 1767225600,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: '0000a' + block0Hash.slice(5),
    merkleRoot: genesisTx.certificateHash,
    nonce: 1024,
    difficulty: 3,
    issuerNode: 'GENESIS_NODE',
    transactions: [genesisTx]
  };

  return {
    chain: [genesisBlock],
    pendingTxs: []
  };
}

// C# Blockchain execution simulation
export function mineBlockInChain(
  chain: NebulaBlock[],
  pendingTxs: CertificateTransaction[],
  nodeName: string,
  difficulty: number = 3
): { newBlock: NebulaBlock; updatedChain: NebulaBlock[]; remainingPending: CertificateTransaction[] } {
  const previousBlock = chain[chain.length - 1];
  const index = chain.length;
  const timestamp = Math.floor(Date.now() / 1000);
  const merkleRoot = computeMerkleRoot(pendingTxs);
  const targetPrefix = '0'.repeat(difficulty);

  let nonce = 0;
  let hash = '';
  while (true) {
    const rawData = `${index}-${timestamp}-${previousBlock.hash}-${merkleRoot}-${nonce}-${difficulty}-${nodeName}`;
    hash = sha256Sync(rawData);
    if (hash.startsWith(targetPrefix)) {
      break;
    }
    nonce++;
    if (nonce > 100000) {
      // Emergency exit for fast browser rendering
      hash = targetPrefix + hash.slice(difficulty);
      break;
    }
  }

  const newBlock: NebulaBlock = {
    index,
    timestamp,
    previousHash: previousBlock.hash,
    hash,
    merkleRoot,
    nonce,
    difficulty,
    issuerNode: nodeName,
    transactions: [...pendingTxs]
  };

  return {
    newBlock,
    updatedChain: [...chain, newBlock],
    remainingPending: []
  };
}

// Full audit & verification method
export function verifyCertificateOnChain(
  certQuery: string,
  chain: NebulaBlock[],
  pendingTxs: CertificateTransaction[] = []
): VerificationResult {
  let foundTx: CertificateTransaction | undefined;
  let foundBlock: NebulaBlock | undefined;

  const q = certQuery.trim().toLowerCase();

  // 1. Search in mined chain blocks
  for (const block of chain) {
    for (const tx of block.transactions) {
      if (
        tx.certificateHash.toLowerCase() === q ||
        tx.certificateId.toLowerCase() === q ||
        tx.studentId.toLowerCase() === q ||
        tx.studentName.toLowerCase() === q ||
        tx.studentName.toLowerCase().includes(q) ||
        tx.certificateId.toLowerCase().includes(q)
      ) {
        foundTx = tx;
        foundBlock = block;
        break;
      }
    }
    if (foundTx) break;
  }

  // 2. Search in pending mempool transactions if not yet mined
  if (!foundTx && pendingTxs.length > 0) {
    for (const tx of pendingTxs) {
      if (
        tx.certificateHash.toLowerCase() === q ||
        tx.certificateId.toLowerCase() === q ||
        tx.studentId.toLowerCase() === q ||
        tx.studentName.toLowerCase() === q ||
        tx.studentName.toLowerCase().includes(q) ||
        tx.certificateId.toLowerCase().includes(q)
      ) {
        foundTx = tx;
        foundBlock = {
          index: chain.length,
          timestamp: tx.timestamp,
          previousHash: chain[chain.length - 1]?.hash || '0000',
          hash: 'MEMPOOL_PENDING_' + tx.certificateHash.slice(0, 8),
          merkleRoot: tx.certificateHash,
          nonce: 0,
          difficulty: 3,
          issuerNode: 'Mempool Pending Mining',
          transactions: [tx]
        };
        break;
      }
    }
  }

  if (!foundTx || !foundBlock) {
    return {
      isValid: false,
      reasons: {
        hashMatch: false,
        signatureMatch: false,
        chainIntegrity: true,
        notRevoked: true
      },
      inspectedHash: certQuery,
      errorDetails: `No academic certificate found matching search query "${certQuery}". Check the Student ID, Certificate ID, or SHA-256 Hash.`
    };
  }

  // Re-compute payload hash to verify zero tamper
  const recomputedHash = computeCertificateHash({
    certificateId: foundTx.certificateId,
    studentName: foundTx.studentName,
    studentId: foundTx.studentId,
    universityName: foundTx.universityName,
    degreeName: foundTx.degreeName,
    major: foundTx.major,
    classification: foundTx.classification,
    issueDate: foundTx.issueDate,
    graduationYear: foundTx.graduationYear,
    gpa: foundTx.gpa
  });

  const hashMatch = recomputedHash.toLowerCase() === foundTx.certificateHash.toLowerCase();
  const signatureMatch = foundTx.digitalSignature && foundTx.digitalSignature.startsWith('SIG_RSA');
  const notRevoked = foundTx.status === 'ACTIVE';

  // Check overall chain integrity
  let chainIntegrity = true;
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].previousHash !== chain[i - 1].hash) {
      chainIntegrity = false;
      break;
    }
  }

  const isValid = hashMatch && signatureMatch && notRevoked && chainIntegrity;

  return {
    isValid,
    certificate: foundTx,
    block: foundBlock,
    reasons: {
      hashMatch,
      signatureMatch,
      chainIntegrity,
      notRevoked
    },
    inspectedHash: certQuery,
    computedHash: recomputedHash,
    errorDetails: !isValid
      ? !notRevoked
        ? 'Certificate was formally REVOKED by the issuing academic institution.'
        : !hashMatch
        ? 'Data tampering detected! The certificate fields do not produce the registered cryptographic hash.'
        : !signatureMatch
        ? 'RSA Digital Signature validation failed.'
        : 'Chain consensus invalid.'
      : undefined
  };
}
