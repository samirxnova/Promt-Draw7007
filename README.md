# Promraw ERC7007 - AI-Powered NFT Drawing Platform

Promraw is a decentralized application that combines AI-powered drawing prompts with NFT minting capabilities on the Ethereum Sepolia testnet. Users can create artwork based on AI-generated prompts, receive AI-based scoring, and mint their creations as unique NFTs.

## 🎯 How It Works

Promraw follows a simple yet engaging flow:

1. **Prompt Generation**: Users are presented with a fun, AI-generated prompt
2. **Creative Drawing**: Users draw their interpretation using our tools
3. **AI Scoring**: The drawing is evaluated by our AI model
4. **NFT Minting**: Users can mint their artwork + scorecard as an AIGC NFT

### 🤪 Silly Prompts
Users are presented with amusing and quirky prompts such as:
- "A shark in a barrel"
- "The world's fastest frog"
- "A penguin teaching mathematics to vegetables"

### 🖌️ Drawing Experience
Our browser-based drawing tool provides a full suite of creative tools:
- Multiple colors and brush sizes
- Shape tools (circles, squares, lines)
- Text annotations
- Undo/redo functionality

### 🤖 AI Scoring System
Once submitted, our AI system powered by Gemini:
- Analyzes the drawing's alignment with the prompt
- Evaluates artistic elements and creativity
- Assigns a score that determines NFT rarity

### ⌨️ Prompt Generation Process
Our prompt system uses a sophisticated AI-powered approach:

1. **Initial Seed**: We started with a curated set of creative prompts
2. **AI Expansion**: Using Gemini, we generated thousands of unique prompts
3. **Human Curation**: Our team ensures all prompts encourage creativity
4. **Continuous Generation**: New prompts are regularly added to keep content fresh

## Features

### Drawing Interface
- 🎨 Rich drawing tools with multiple colors and brush sizes
- ⚡ Real-time shape preview for circles, squares, and lines
- ✏️ Text tool for adding annotations
- 🔄 Undo/Redo functionality
- 🧹 Eraser tool for corrections

### AI Integration
- 🤖 AI-generated creative drawing prompts
- 🎯 AI-powered scoring system
- 🖼️ AI image enhancement of user drawings

### NFT Features
- 🌟 ERC7007 standard implementation for AI-generated NFTs
- 💎 Rarity system based on AI scores
- 🏆 On-chain storage of AI prompts and scores
- 📊 IPFS metadata storage

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contracts**: Solidity + Hardhat
- **AI**: Google's Gemini API
- **Storage**: IPFS (NFT.Storage)
- **Web3**: ethers.js

## Prerequisites

- Node.js v18+
- MetaMask wallet
- Sepolia testnet ETH
- Required API keys:
  - Gemini API key
  - NFT.Storage API key
  - Infura API key
  - Etherscan API key

## Setup

1. Clone the repository and install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create a \`.env\` file with the following variables:
\`\`\`env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_NFT_STORAGE_KEY=your_nft_storage_key_here
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=Sepolia

# Hardhat deployment
INFURA_API_KEY=your_infura_api_key_here
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
\`\`\`

3. Compile the smart contract:
\`\`\`bash
npm run compile
\`\`\`

4. Deploy the contract to Sepolia:
\`\`\`bash
npm run deploy:sepolia
\`\`\`

5. Update the \`.env\` file with the deployed contract address:
\`\`\`env
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
\`\`\`

6. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Smart Contract

The PromrawERC7007 contract extends the ERC721 standard with additional features for AI-generated NFTs:

- Stores AI model version used for generation
- Records original prompts that inspired the artwork
- Maintains AI-generated scores for rarity
- Implements proper access control and security measures

### Contract Functions

- \`mint(string tokenURI, string aiModelVersion, string prompt, uint256 score)\`: Mint a new NFT
- \`getAIModelVersion(uint256 tokenId)\`: Get the AI model used
- \`getPrompt(uint256 tokenId)\`: Get the original prompt
- \`getScore(uint256 tokenId)\`: Get the AI-generated score

## Usage

1. **Connect Wallet**
   - Click "Connect Wallet" and ensure you're on Sepolia testnet
   - Make sure you have some Sepolia ETH for gas fees

2. **Create Artwork**
   - Use the provided drawing tools to create your artwork
   - Follow the AI-generated prompt for inspiration
   - Utilize various shapes and colors for better results

3. **Submit for Scoring**
   - Click "Submit for AI Scoring" when finished
   - The AI will evaluate your artwork and assign a score
   - Higher scores result in rarer NFTs

4. **Mint NFT**
   - Review your score and AI-enhanced version
   - Click "Mint NFT" to create your unique token
   - Confirm the transaction in MetaMask
   - Your NFT will be minted with all metadata stored on IPFS

## Development

- \`npm run dev\`: Start development server
- \`npm run build\`: Build for production
- \`npm run preview\`: Preview production build
- \`npm run compile\`: Compile smart contracts
- \`npm run deploy:sepolia\`: Deploy to Sepolia
- \`npm run verify:sepolia\`: Verify contract on Etherscan

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.