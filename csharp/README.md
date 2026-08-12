# Nebula - Academic Certificate Verification & Validation System in C#

## Overview
**Nebula** is a full-featured cryptographic blockchain application built in **C# (.NET 10.0 / .NET 9.0 / .NET 8.0)** designed to solve the global problem of fake university degrees and fraudulent academic credentials.

## Key C# Features
- **Proof-of-Work & Proof-of-Authority Consensus Engine (`NebulaChain.cs`, `NebulaBlock.cs`)**
- **SHA-256 Canonical Metadata Hashing (`CryptoUtils.cs`)**
- **RSA 2048-Bit Digital Signature Verification (`CryptoUtils.cs`)**
- **Merkle Tree Binary Root Computation (`MerkleTree.cs`)**
- **Tamper-Evident Immutability Verification & Audit Trail**

## Prerequisites
- .NET 10.0 SDK (or .NET 9.0 / .NET 8.0 SDK) installed on your computer.
- Visual Studio 2022, VS Code, or Rider (optional).

## How to Run (dotnet CLI)
```bash
# 1. Open your terminal in this directory
cd csharp

# 2. Restore dependencies and compile
dotnet restore
dotnet build

# 3. Execute the C# blockchain CLI
dotnet run
```
