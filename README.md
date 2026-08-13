# 🌌 Nebula — Blockchain Academic Certificate Verification System

> **A blockchain-based academic certificate issuance, verification, and validation platform designed to combat fraudulent academic credentials.**

Nebula is a decentralized academic certificate verification system that allows universities to issue digitally signed academic certificates and enables students, employers, institutions, and other authorized parties to verify the authenticity of those certificates.

The system combines a modern web interface, cryptographic hashing, digital signatures, Merkle Trees, blockchain data structures, and a Solidity smart contract to create a tamper-evident academic credential system.

---

## 🚀 Problem

Academic certificate fraud is a major problem. Traditional paper-based and centralized verification systems can be:

* Slow to verify
* Expensive for institutions
* Difficult for employers to access
* Vulnerable to document alteration
* Dependent on contacting the issuing institution
* Difficult to scale across multiple universities

Nebula addresses this problem by creating a system where certificate information can be cryptographically secured and verified against blockchain records.

---

## 💡 Solution

Nebula provides a digital certificate lifecycle:

```text
University
    │
    │ Issue Certificate
    ▼
Cryptographic Processing
    │
    ├── SHA-256 Hashing
    ├── Digital Signature
    └── Merkle Tree
    │
    ▼
Blockchain Registry
    │
    ▼
┌─────────────────────────────┐
│       Certificate           │
│        Registry             │
└─────────────────────────────┘
    │
    ├──────────────┐
    │              │
    ▼              ▼
 Student        Employer
    │              │
    └──────┬───────┘
           ▼
     Verify Certificate
```

Instead of trusting a certificate document alone, the verifier can check the certificate against cryptographically secured blockchain data.

---

# ✨ Features

## 🎓 Certificate Issuance

Authorized universities can issue academic certificates containing information such as:

* Certificate ID
* Student name
* Student ID
* University
* Degree
* Major
* Classification
* GPA
* Issue date
* Issuing university address
* Merkle Tree root
* Digital signature

---

## 🔍 Certificate Verification

Anyone with the appropriate certificate identifier can verify whether a certificate:

* Exists
* Was issued by an authorized university
* Has been revoked
* Is currently valid
* Belongs to the recorded student
* Was issued by the recorded institution

---

## 🔐 Cryptographic Security

Nebula uses multiple cryptographic mechanisms to protect certificate integrity.

### SHA-256 Hashing

Certificate metadata can be converted into a deterministic cryptographic hash.

```text
Certificate Data
       │
       ▼
    SHA-256
       │
       ▼
  Fixed-Length Hash
```

If the underlying certificate information changes, its hash changes.

---

### Digital Signatures

Certificates can be associated with digital signatures to provide cryptographic evidence that the certificate was authorized by an issuer.

The C# implementation includes RSA-based digital signature functionality.

---

### 🌳 Merkle Trees

Nebula includes a Merkle Tree implementation for grouping and efficiently representing certificate transactions.

```text
                 Merkle Root
                     │
            ┌────────┴────────┐
            │                 │
          Hash AB           Hash CD
          /    \            /    \
         /      \          /      \
       Hash A  Hash B    Hash C  Hash D
```

A Merkle root can act as a compact cryptographic representation of a group of certificate records.

---

# ⛓️ Blockchain Architecture

Nebula contains a custom C# blockchain implementation for demonstrating the underlying blockchain concepts.

The blockchain includes:

* Blocks
* Transactions
* Block hashes
* Previous block hashes
* Proof-of-Work
* Proof-of-Authority concepts
* Digital signatures
* Merkle Trees
* Tamper detection
* Chain validation

Each block maintains a relationship with the previous block:

```text
Block 1
   │
   │ Previous Hash
   ▼
Block 2
   │
   │ Previous Hash
   ▼
Block 3
   │
   │ Previous Hash
   ▼
Block 4
```

Changing information inside an earlier block causes its cryptographic hash to change, breaking the chain relationship.

---

# 🏛️ Proof of Authority

Nebula's Solidity registry uses a Proof-of-Authority-style university consortium model.

Only authorized university addresses are allowed to issue certificates.

```text
              Consortium Admin
                     │
        ┌────────────┼────────────┐
        │            │            │
       UG          KNUST         UCC
        │            │            │
        └────────────┼────────────┘
                     │
              Certificate
                 Registry
```

The smart contract maintains an authorized university validator set.

Universities can be added to the consortium by the consortium administrator.

---

# 📜 Smart Contract

The Solidity smart contract is located at:

```text
contracts/AcademicRegistry.sol
```

The contract provides functions for:

### Issue Certificate

```solidity
issueCertificate(...)
```

Allows an authorized university to register a certificate on-chain.

### Verify Certificate

```solidity
verifyCertificate(...)
```

Allows users to check the existence and validity of a certificate.

### Revoke Certificate

```solidity
revokeCertificate(...)
```

Allows the issuing university or consortium administrator to revoke a certificate.

### Add University

```solidity
addUniversityNode(...)
```

Allows the consortium administrator to authorize a new university.

### Certificate Count

```solidity
getCertificateCount()
```

Returns the number of registered certificates.

---

# 🖥️ Application Architecture

Nebula is divided into several major components.

```text
                    NEBULA
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
   Web Frontend    C# Blockchain    Solidity Contract
       │               │                │
       │               │                │
       ▼               ▼                ▼
   React/Vite      Cryptography      EVM Registry
       │
       ├── Issuer Portal
       ├── Student Vault
       ├── Verifier Portal
       ├── Chain Explorer
       └── C# Workspace
```

---

# 🧩 Main Application Components

## Issuer Portal

Used by universities or authorized institutions to issue certificates.

---

## Student Vault

Provides students with a centralized interface for viewing and managing their academic credentials.

---

## Verifier Portal

Designed for employers, institutions, lecturers, and other parties who need to verify an academic credential.

---

## Chain Explorer

Provides a visual representation of blockchain blocks, transactions, hashes, and chain relationships.

---

## C# Workspace

Provides an environment for interacting with and demonstrating the C# blockchain implementation.

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Motion

## Blockchain

* Solidity
* Ethereum-compatible smart contracts
* Proof-of-Authority concept
* Custom C# blockchain implementation

## Cryptography

* SHA-256
* RSA digital signatures
* Merkle Trees
* Cryptographic hashing

## C# Backend / Blockchain Engine

* C#
* .NET
* Custom blockchain implementation

## Other Technologies

* QR Code generation
* PDF certificate generation
* HTML Canvas
* JavaScript ZIP generation

---

# 📁 Project Structure

```text
nebula/
│
├── contracts/
│   └── AcademicRegistry.sol
│
├── csharp/
│   ├── NebulaBlock.cs
│   ├── NebulaChain.cs
│   ├── CryptoUtils.cs
│   ├── CertificateTransaction.cs
│   ├── MerkleTree.cs
│   ├── Program.cs
│   ├── Nebula.csproj
│   └── README.md
│
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ChainExplorer.tsx
│   │   ├── StudentVault.tsx
│   │   ├── VerifierPortal.tsx
│   │   ├── IssuerPortal.tsx
│   │   ├── CSharpWorkspace.tsx
│   │   └── UniversityLogo.tsx
│   │
│   ├── services/
│   │   ├── csharpBlockchainEngine.ts
│   │   └── csharpCodeFiles.ts
│   │
│   ├── types/
│   │   └── blockchain.ts
│   │
│   ├── data/
│   │   └── consortiumUniversities.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

# ⚙️ Installation

## Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Git

For the C# blockchain component:

* .NET SDK

---

# 📥 Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

cd YOUR_REPOSITORY
```

---

# 📦 Install Dependencies

```bash
npm install
```

---

# ▶️ Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available through the local development URL displayed by Vite.

---

# 🧪 Build for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

# 🔗 Running the C# Blockchain

Navigate into the C# directory:

```bash
cd csharp
```

Restore dependencies:

```bash
dotnet restore
```

Build the blockchain application:

```bash
dotnet build
```

Run it:

```bash
dotnet run
```

---

# 🔐 Security Model

Nebula uses several layers of security.

```text
Certificate
     │
     ▼
Canonical Metadata
     │
     ▼
SHA-256 Hash
     │
     ├───────────────┐
     ▼               ▼
Digital Signature   Merkle Tree
     │               │
     └───────┬───────┘
             ▼
        Blockchain
             │
             ▼
      Verification
```

The goal is to make unauthorized modification of certificate information detectable.

---

# 🔄 Certificate Lifecycle

### 1. University Issues Certificate

The university enters the student's academic information.

### 2. Certificate Data Is Processed

The system generates the required cryptographic information.

### 3. Certificate Is Registered

The certificate can be recorded in the blockchain registry.

### 4. Student Receives Certificate

The student can access their credential through the application.

### 5. Employer Verifies Certificate

The employer enters the certificate ID or uses the available verification mechanism.

### 6. Blockchain Record Is Checked

Nebula checks the certificate against the registered record.

### 7. Verification Result

The system reports whether the credential is valid, invalid, missing, or revoked.

---

# 🎯 Example Use Case

A graduate applies for a job and provides a Nebula certificate.

The employer does not need to manually contact the university.

Instead:

```text
Employer
   │
   ▼
Certificate ID
   │
   ▼
Nebula Verification Portal
   │
   ▼
Blockchain Registry
   │
   ├── Certificate Exists?
   ├── Authorized Issuer?
   ├── Revoked?
   └── Valid?
   │
   ▼
Verification Result
```

This can significantly simplify credential verification.

---

# ⚠️ Current Project Status

Nebula is currently a **prototype / demonstration system**.

The project demonstrates the core concepts required for a blockchain-based academic credential verification platform.

### Implemented / Demonstrated

* [x] React web application
* [x] Certificate issuance interface
* [x] Certificate verification interface
* [x] Student certificate vault
* [x] Blockchain explorer interface
* [x] Custom C# blockchain implementation
* [x] SHA-256 hashing
* [x] RSA digital signatures
* [x] Merkle Tree implementation
* [x] Solidity academic registry
* [x] University authorization model
* [x] Certificate revocation mechanism
* [x] Certificate verification logic
* [x] QR/PDF-related certificate functionality

### Future Improvements

* [ ] Deploy smart contract to a public testnet
* [ ] Integrate MetaMask / wallet authentication
* [ ] Connect the frontend directly to the deployed contract
* [ ] Implement decentralized storage such as IPFS
* [ ] Implement production-grade university identity management
* [ ] Add stronger role-based access control
* [ ] Add comprehensive automated testing
* [ ] Add multi-chain support
* [ ] Implement production-grade key management
* [ ] Conduct a formal security audit

---

# 🔮 Future Vision

Nebula can evolve into a university consortium infrastructure where participating institutions share a common verification layer.

Instead of every employer contacting individual universities, a trusted consortium could provide a common verification network.

```text
          University Consortium
                   │
       ┌───────────┼───────────┐
       │           │           │
      UG         KNUST        UCC
       │           │           │
       └───────────┼───────────┘
                   │
                   ▼
             NEBULA NETWORK
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    Students   Employers   Institutions
```

---

# 🧠 Why Blockchain?

Blockchain is useful for this problem because it provides:

### Immutability

Once a certificate record is securely recorded, unauthorized modifications become detectable.

### Transparency

Authorized participants can verify records without relying solely on a paper document.

### Decentralization

A consortium model can distribute trust among participating institutions rather than relying entirely on one central database.

### Cryptographic Integrity

Hashes and digital signatures allow the system to detect data modification and authenticate issuers.

### Auditability

Blockchain events and records can provide an auditable history of certificate issuance and revocation.

---

# ⚠️ Disclaimer

Nebula is an educational and prototype project.

The system should **not** be considered a production-ready national academic credential infrastructure without further security auditing, legal review, privacy analysis, identity management, key management, smart-contract auditing, and deployment testing.

The university addresses included in the demonstration smart contract are prototype/test addresses and should not be treated as official institutional blockchain identities.

---

# 👨‍💻 Development

Nebula was developed as a demonstration of how blockchain and cryptography can be applied to academic credential verification.

The project combines:

```text
Web Development
       +
Blockchain
       +
Cryptography
       +
Smart Contracts
       +
C#
       +
Academic Credential Verification
```

---

# 📄 License

This project is released under the MIT License.

See the `LICENSE` file for more information.

---

## 🌌 Nebula

**Verify credentials.
Protect academic records.
Build trust with cryptography.**

> *A certificate should be more than a piece of paper — it should be verifiable proof.*
