# Tableland Attestation Service (TAS)

---
## Encode Open Data Hack Project 🚀

<div >
  <img src="./client/public/logo2.jpeg" alt="TAS Logo" style="border-radius: 5%; width: 400px;" />
</div>

---

- **Author:** [nijoe1](https://github.com/nijoe1)
- **Dapp website:** [Check TAS](https://tas.vercel.app)
- **Demo Video:** [Watch Demo](https://www.youtube.com/watch?v=La7Rdj48UJM&t=194s)
---
## 📖 Introduction

- Tableland Attestation Service (TAS) brings attestation services to the Filecoin network. TAS migrated the EAS protocol together with Tableland to create the Tableland Attestation Service. TAS can seamlessly work with all networks supported by Tableland and is currently deployed on Filecoin Calibration and Polygon Mumbai networks.

---

## ♯ Description

- TAS is a robust and extensible protocol designed to bring the power of attestations to the Filecoin ecosystem. It leverages Tableland, a decentralized SQLite indexing protocol, at its core, to seamlessly integrate with Filecoin and EVM-compatible blockchains. TAS empowers users to generate and verify attestations, providing cryptographically signed confirmation of the authenticity and accuracy of information.

- TAS goes beyond traditional attestation services by offering file attestations for various file types using Lighthouse storage. This means every kind of file can be securely stored on IPFS and replicated on Filecoin, ensuring persistent data storage in the decentralized web. Additionally, TAS provides subscription-based and access control schemas, allowing for tailored access to attestations and versatile data management, including support for private or open AC schemas.

---

## ☝ Advantages compared to EAS

- **Tableland Integration**:
  - TAS leverages Tableland for indexing attestations and schemas, resulting in significantly faster performance compared to GraphQL.
  - Developers can create SQLite queries directly to the Tableland gateway, eliminating the need for a GraphQL client.

- **Ceramic Network Integration**:
  - TAS is integrated with the Ceramic network to provide OffChain attestations, enhancing decentralization.

- **Out-of-the-Box Features**:
  - TAS offers out-of-the-box file attestations stored on IPFS and Filecoin using Lighthouse.
  - It also provides encrypted schemas with encrypted attestations using the Lighthouse Kavach network, providing a more efficient solution compared to costly merkle trees used in EAS.

---

## 👇 Disadvantages compared to EAS

- Tableland has a limitation of supporting a maximum of 1024 string length per column insertion. The attested data are encoded to bytes, resulting in larger string lengths stored in the table, limiting the amount of data that can be attested.
  - To address this limitation, before making the attestation, we encode the data to base64, providing a 33% more space for attestation data.

---

# 👨‍💻Technologies Used 🤖

TAS leverages several cutting-edge technologies to offer a comprehensive and secure attestation service:

### Tableland:
- Replacing the centralized GraphQL infrastructure of EAS with a decentralized network for faster and complex queries. [Tableland Queries](https://github.com/nijoe1/TAS/blob/main/client/lib/tableland.js)
- Implemented a mechanism to create new tables within the contract whenever the number of entries exceeds **100,000**, surpassing Tableland's table limitation. This ensures the protocol can handle an unlimited number of schemas and attestations, with only SQL queries needing modification. Through the unionAll function applied to similarly created tables, the protocol's data remains accessible and structured.
- Here are all the tableland Indexer Contracts. [Tableland Contracts](https://github.com/nijoe1/TAS/tree/main/contracts/contracts/tablelandIndexers)
### IPFS and Filecoin:
- Utilized for storing attested files securely, ensuring persistent data storage and accessibility using Lighthouse RAAS service.
### Lighthouse Storage:
- Powering file attestations by securely storing files on IPFS and replicating them on Filecoin for longevity and accessibility using the RAAS service. [Lighthouse Usage Code Link](https://github.com/nijoe1/TAS/blob/main/client/lib/lighthouse.js)
### Lighthouse Kavach Network:
- Providing encryption capabilities for subscription-based schemas and encrypted access control based schemas, safeguarding sensitive data in attestations. [Kavach Usage Code Link](https://github.com/nijoe1/TAS/blob/main/client/lib/lighthouse.js)
### Ceramic Network:
- Enabling users to store and manage attestations securely and in a decentralized environment off-chain. Together with orbis.club, it offers a social layer about schemas and attestations. [Ceramic Usage](https://github.com/nijoe1/TAS/blob/main/client/lib/offchain.ts) [Signing Typed Data to Create Verifiable OffChain Attestations](https://github.com/nijoe1/TAS/blob/main/client/components/AttestOffChain.tsx)

---

## 🧾 Contracts

 - [contracts](https://github.com/nijoe1/TAS/tree/main/contracts/contracts)

---

## ☯ Unlocked Use Cases for the Filecoin Ecosystem

- **EAS Use Cases**:
  - [Example Use Cases](https://docs.attest.sh/docs/category/example-use-cases)

- **File Attestations**:
  - Securely store and attest various file types on IPFS and Filecoin, ensuring the authenticity and integrity of the stored files.

- **Filecoin Actors Reputation**:
  - Monitoring and establishing reputations for Filecoin actors (like storage providers, clients, etc.) based on their behavior, reliability, and performance within the network.

- **Retrieval Oracle Attestations**:
  - Utilizing attestations to verify and validate the reliability and efficiency of retrieval oracles within the Filecoin ecosystem, ensuring accurate and timely data retrieval.

- **Verifiable Credentials**:
  - Generating and verifying verifiable credentials, providing a secure and tamper-proof way to manage and share important credentials and certifications within the Filecoin network.

- **Users Reputation Scoring through Attestations**:
  - Creating a reputation scoring system for users based on their interactions, contributions, and attestations within the Filecoin ecosystem, promoting trust and collaboration.

---

TAS unlocks a multitude of possibilities within the Filecoin ecosystem, promoting trust, security, and transparency across diverse applications and industries.

## 📄 License

This project is licensed under the MIT License - See the [LICENSE](./LICENSE) file for details.

## 🛠️ Built With

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [wagmi](https://web3js.readthedocs.io/en/v1.3.4/)
- [viem](https://web3js.readthedocs.io/en/v1.3.4/)

## 🤝 Acknowledgements

- [OpenZeppelin](https://openzeppelin.com/)
- [EAS](https://docs.attest.sh/docs/welcome)
- [Lighthouse](https://www.lighthouse.storage/)
- [Tableland](https://tableland.xyz/)
- [IPFS](https://ipfs.io/)
- Encode Team for the hackathon experience

