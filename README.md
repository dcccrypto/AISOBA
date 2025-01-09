# SOBA Verse - AI-Generated SOBA Chimpanzee PFP Platform

SOBA Verse is a next-generation platform for creating and minting unique AI-generated SOBA chimpanzee profile pictures (PFPs) on the Solana blockchain. Powered by Sol Bastard, this platform allows users to generate, customize, and mint their own unique SOBA chimp NFTs.

![SOBA Verse Logo](/public/logo.png)

## 🚀 Features

- **AI-Powered Generation**: Create unique SOBA chimpanzee PFPs using advanced AI technology
- **Custom Frames**: Choose from various premium frames to enhance your NFT:
  - Basic Frame (0 $SOBA)
  - Modern Frame (200,000 $SOBA)
  - Elegant Frame (300,000 $SOBA)
  - Minimal Frame (400,000 $SOBA)
  - Premium Frame (500,000 $SOBA)
  - Legendary Frame (1,000,000 $SOBA)
- **Solana Blockchain Integration**: Seamless NFT minting on Solana
- **$SOBA Token Integration**: Platform utility token for accessing features
- **Decentralized Storage**: IPFS/NFT.Storage for permanent NFT storage
- **Modern UI/UX**: Responsive and intuitive user interface

## 🛠️ Technical Architecture

### Frontend Architecture
- **Next.js 13 App Router**: Utilizing the latest Next.js features for optimal performance
- **React Components**: Modular component architecture with TypeScript
- **State Management**: 
  - React Context for wallet and token state
  - Local state with useState for component-level state
  - Server state management with SWR for data fetching
- **Styling**: 
  - Tailwind CSS with custom configuration
  - Custom CSS modules for component-specific styling
  - Responsive design with mobile-first approach
- **Web3 Integration**:
  - @solana/web3.js for blockchain interactions
  - @solana/wallet-adapter-react for wallet connections
  - Custom hooks for blockchain state management

### Backend Services
- **API Routes**:
  - `/api/generate-image`: Handles AI image generation requests
  - `/api/upload`: Manages NFT metadata and image uploads
  - `/api/check-generation-limit`: Rate limiting and token checks
  - `/api/token-price`: Real-time $SOBA token price updates
  - `/api/record-nft`: Records minted NFTs in database

- **Database Schema (Prisma)**:
```prisma
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  generations   Generation[]
  nfts          NFT[]
}

model Generation {
  id        String   @id @default(cuid())
  userId    String
  imageUrl  String
  prompt    String
  status    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model NFT {
  id          String   @id @default(cuid())
  userId      String
  mintAddress String   @unique
  imageUrl    String
  frameType   String
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

### Blockchain Integration

#### NFT Minting Process
1. **Metadata Preparation**:
```typescript
const onChainMetadata: DataV2 = {
  name: "SOBA Chimp",
  symbol: "SOBA",
  uri: finalImageUrl,
  sellerFeeBasisPoints: 500,
  creators: [
    {
      address: publicKey,
      verified: true,
      share: 100
    }
  ],
  collection: {
    verified: false,
    key: COLLECTION_ADDRESS
  },
  uses: null
};
```

2. **Transaction Construction**:
```typescript
const transaction = new Transaction();
transaction.add(
  SystemProgram.createAccount({...}),
  createInitializeMintInstruction(...),
  createAssociatedTokenAccountInstruction(...),
  createMintToInstruction(...),
  createCreateMetadataAccountV3Instruction(...)
);
```

### AI Integration
- **Replicate AI Configuration**:
```typescript
const prediction = await replicate.predictions.create({
  version: "stability-ai/sdxl:latest",
  input: {
    prompt: "SOBA chimpanzee profile picture, digital art style",
    negative_prompt: "deformed, blurry, bad anatomy, disfigured",
    num_outputs: 1,
    scheduler: "K_EULER",
    num_inference_steps: 50
  }
});
```

### Frame System Implementation
```typescript
interface Frame {
  id: number;
  path: string;
  name: string;
  required: number; // Required SOBA tokens
  dimensions: {
    width: number;
    height: number;
  };
  overlay: {
    position: 'center' | 'top' | 'bottom';
    blend: 'multiply' | 'overlay' | 'screen';
  };
}

const overlayOptions: Frame[] = [
  {
    id: 1,
    path: '/nft/nftoverlay.png',
    name: 'Basic Frame',
    required: 0,
    dimensions: { width: 1024, height: 1024 },
    overlay: { position: 'center', blend: 'multiply' }
  },
  // ... other frame configurations
];
```

### Token Integration
- **SOBA Token Contract**: `25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH`
- **Token Check Implementation**:
```typescript
async function checkBalance(wallet: PublicKey): Promise<number> {
  const tokenAccount = await getAssociatedTokenAddress(
    new PublicKey('25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH'),
    wallet
  );
  
  const account = await getAccount(connection, tokenAccount);
  return Number(account.amount) / 1e6;
}
```

### Security Implementations

#### API Protection
```typescript
// Rate Limiting Middleware
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Wallet Signature Verification
const message = "Authenticate with SOBA Verse";
const signedMessage = await wallet.signMessage(
  new TextEncoder().encode(message)
);
```

#### Environment Variables Structure
```env
# Blockchain
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOBA_TOKEN_ADDRESS=25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH

# AI Services
REPLICATE_API_KEY=your_api_key
REPLICATE_MODEL_VERSION=stability-ai/sdxl:latest

# Database
DATABASE_URL=postgres://user:pass@neon.tech/dbname

# Storage
NFT_STORAGE_KEY=your_key
STORAGE_ENDPOINT=https://api.nft.storage

# Security
JWT_SECRET=your_secret
ADMIN_WALLET_ADDRESSES=["address1", "address2"]

# Feature Flags
ENABLE_PREMIUM_FRAMES=true
MAX_DAILY_GENERATIONS=10
```

### Testing Setup
```typescript
// Jest Configuration
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1'
  }
};

// Example Test Suite
describe('NFTMinter Component', () => {
  it('should handle minting process', async () => {
    const mockWallet = {
      publicKey: new PublicKey('...'),
      signTransaction: jest.fn()
    };
    
    // Test implementation
  });
});
```

### Deployment Configuration

#### Vercel Configuration
```json
{
  "env": {
    "NEXT_PUBLIC_SOLANA_RPC_URL": "@solana_rpc_url",
    "DATABASE_URL": "@database_url"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SOBA_TOKEN_ADDRESS": "25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH"
    }
  }
}
```

## 🚦 Prerequisites

- Node.js 16+
- Solana CLI tools
- Phantom Wallet or other Solana wallets
- $SOBA tokens for premium features

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/soba-verse.git
cd soba-verse
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## 🎨 Usage

1. **Connect Wallet**
   - Visit the platform and connect your Solana wallet
   - Ensure you have sufficient $SOBA tokens

2. **Generate PFP**
   - Navigate to the creation page
   - Customize your SOBA chimp preferences
   - Generate your unique PFP using AI

3. **Select Frame**
   - Choose from available frames based on your $SOBA balance
   - Preview your NFT with the selected frame

4. **Mint NFT**
   - Review your creation
   - Confirm the transaction
   - Receive your unique SOBA chimp NFT

## 🔐 Security Best Practices

- Use environment variables for sensitive data
- Implement rate limiting on API routes
- Validate wallet signatures for authentication
- Secure RPC endpoint usage
- Regular security audits
- Smart contract testing and auditing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- [Website](https://sobaverse.art)
- [Twitter](https://twitter.com/sobaverse)
- [Discord](https://discord.gg/sobaverse)
- [$SOBA Token](https://jup.ag/swap/SOL-soba)

## 💬 Support

For support, please join our [Discord community](https://discord.gg/sobaverse) or open an issue in this repository.

## ✨ Acknowledgments

- Sol Bastard community
- Solana Foundation
- Metaplex Foundation
- All our contributors and supporters
