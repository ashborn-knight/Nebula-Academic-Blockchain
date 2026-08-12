// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AcademicRegistry - Ghana University Consortium PoA Registry
 * @notice Smart Contract for verifying academic degree certificates on-chain
 *         using Proof of Authority (PoA) consensus among accredited universities.
 */
contract AcademicRegistry {
    // Contract Owner / Governance Admin
    address public consortiumAdmin;

    // Structure defining a Certificate
    struct Certificate {
        string certId;           // e.g. "NEBULA-2026-UG-4892"
        string studentName;      // e.g. "Kofi Mensah"
        string studentId;        // e.g. "UG-10928374"
        string universityName;   // e.g. "University of Ghana (UG)"
        string degreeName;       // e.g. "Bachelor of Science"
        string major;            // e.g. "Computer Science"
        string classification;   // e.g. "First Class Honours"
        string gpa;              // e.g. "3.85"
        uint256 issueTimestamp;  // Unix timestamp
        address issuerAddress;   // Signing Registrar Wallet Address
        bytes32 merkleRoot;      // Batch Merkle Tree Root Hash
        bytes digitalSignature;  // RSA/ECDSA Cryptographic Signature
        bool isRevoked;          // Revocation Status Flag
        string revocationReason; // Reason if revoked
    }

    // Storage Mappings
    mapping(string => Certificate) private certificates;
    mapping(address => bool) public authorizedUniversities; // PoA Validator Set
    mapping(address => string) public universityNames;
    
    string[] public registeredCertIds;

    // Events
    event CertificateIssued(
        string indexed certId,
        string studentName,
        string universityName,
        address indexed issuer
    );
    event CertificateRevoked(string indexed certId, string reason, address indexed revokedBy);
    event UniversityAuthorized(address indexed uniAddress, string name);
    event UniversityDeauthorized(address indexed uniAddress);

    // Modifiers
    modifier onlyConsortiumAdmin() {
        require(msg.sender == consortiumAdmin, "Only Consortium Governance Admin can perform this action");
        _;
    }

    modifier onlyAuthorizedUniversity() {
        require(authorizedUniversities[msg.sender], "Access Denied: Caller is not an authorized PoA University Node");
        _;
    }

    constructor() {
        consortiumAdmin = msg.sender;

        // Pre-authorize Ghana Consortium Universities (PoA Validator Set)
        _authorizeUniversity(0x71C95911E9a5D330f4d621842EC243EE134388A2, "University of Ghana (UG)");
        _authorizeUniversity(0x3C44CdDFA0a93888936546D1b2060253C3d04018, "KNUST");
        _authorizeUniversity(0x90F79bf6EB2c4f870365E785982E1f101E93b906, "University of Cape Coast (UCC)");
        _authorizeUniversity(0x15d34AA54267DB7D7c367839AAf71A00a2C6A659, "Ashesi University");
        _authorizeUniversity(0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc, "UPSA");
        _authorizeUniversity(0x976EA74026E726554dB657fA54763abd0C3a0aa9, "GIMPA");
    }

    function _authorizeUniversity(address _uni, string memory _name) internal {
        authorizedUniversities[_uni] = true;
        universityNames[_uni] = _name;
        emit UniversityAuthorized(_uni, _name);
    }

    // Add a new university to PoA Validator Set
    function addUniversityNode(address _uni, string memory _name) external onlyConsortiumAdmin {
        require(_uni != address(0), "Invalid address");
        _authorizeUniversity(_uni, _name);
    }

    // Issue a single Certificate on-chain
    function issueCertificate(
        string memory _certId,
        string memory _studentName,
        string memory _studentId,
        string memory _universityName,
        string memory _degreeName,
        string memory _major,
        string memory _classification,
        string memory _gpa,
        bytes32 _merkleRoot,
        bytes memory _signature
    ) external onlyAuthorizedUniversity {
        require(bytes(certificates[_certId].certId).length == 0, "Certificate ID already exists on-chain!");

        certificates[_certId] = Certificate({
            certId: _certId,
            studentName: _studentName,
            studentId: _studentId,
            universityName: _universityName,
            degreeName: _degreeName,
            major: _major,
            classification: _classification,
            gpa: _gpa,
            issueTimestamp: block.timestamp,
            issuerAddress: msg.sender,
            merkleRoot: _merkleRoot,
            digitalSignature: _signature,
            isRevoked: false,
            revocationReason: ""
        });

        registeredCertIds.push(_certId);

        emit CertificateIssued(_certId, _studentName, _universityName, msg.sender);
    }

    // Revoke a Certificate (Only issuing university or Consortium Admin)
    function revokeCertificate(string memory _certId, string memory _reason) external {
        Certificate storage cert = certificates[_certId];
        require(bytes(cert.certId).length > 0, "Certificate does not exist");
        require(
            msg.sender == cert.issuerAddress || msg.sender == consortiumAdmin,
            "Unauthorized: Only the issuing university or admin can revoke this certificate"
        );
        require(!cert.isRevoked, "Certificate is already revoked");

        cert.isRevoked = true;
        cert.revocationReason = _reason;

        emit CertificateRevoked(_certId, _reason, msg.sender);
    }

    // Verify Certificate (Publicly accessible to Employers, Students, Lecturers)
    function verifyCertificate(string memory _certId)
        external
        view
        returns (
            bool exists,
            bool isValid,
            bool isRevoked,
            string memory studentName,
            string memory universityName,
            string memory degreeName,
            address issuerAddress,
            uint256 issueTimestamp,
            string memory revocationReason
        )
    {
        Certificate memory cert = certificates[_certId];
        if (bytes(cert.certId).length == 0) {
            return (false, false, false, "", "", "", address(0), 0, "");
        }

        bool isIssuerAuthorized = authorizedUniversities[cert.issuerAddress];
        bool valid = isIssuerAuthorized && !cert.isRevoked;

        return (
            true,
            valid,
            cert.isRevoked,
            cert.studentName,
            cert.universityName,
            cert.degreeName,
            cert.issuerAddress,
            cert.issueTimestamp,
            cert.revocationReason
        );
    }

    // Get total issued certificates count
    function getCertificateCount() external view returns (uint256) {
        return registeredCertIds.length;
    }
}
