export interface CertificateData {
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
  issuerPublicKey: string;
}

export interface CertificateTransaction {
  id: string;
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
  certificateHash: string; // SHA-256 of certificate metadata
  digitalSignature: string; // RSA signature by University
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  timestamp: number;
}

export interface MerkleProofStep {
  hash: string;
  position: 'left' | 'right';
}

export interface NebulaBlock {
  index: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  merkleRoot: string;
  nonce: number;
  difficulty: number;
  issuerNode: string;
  transactions: CertificateTransaction[];
}

export interface NodePeer {
  id: string;
  name: string;
  region: string;
  status: 'ONLINE' | 'SYNCING' | 'OFFLINE';
  lastBlockHeight: number;
  latencyMs: number;
  isValidator: boolean;
}

export interface CSharpSourceFile {
  filename: string;
  path: string;
  category: 'Core' | 'Contracts' | 'Crypto' | 'Server' | 'Project';
  description: string;
  code: string;
}

export interface VerificationResult {
  isValid: boolean;
  certificate?: CertificateTransaction;
  block?: NebulaBlock;
  merklePath?: MerkleProofStep[];
  reasons: {
    hashMatch: boolean;
    signatureMatch: boolean;
    chainIntegrity: boolean;
    notRevoked: boolean;
  };
  inspectedHash?: string;
  computedHash?: string;
  errorDetails?: string;
}

export type TabType = 'verify' | 'issue' | 'vault' | 'explorer';
