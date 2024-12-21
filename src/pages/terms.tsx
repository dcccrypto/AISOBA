import Layout from '../components/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="responsive-container py-12">
        <h1 className="text-3xl font-bold mb-8 text-white">SOBA Verse Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            Welcome to SOBA Verse. By accessing and using our platform, you agree to be bound by these Terms of Service 
            and our Privacy Policy. SOBA Verse is a next-generation platform for creating and minting AI-generated NFT artwork 
            on the Solana blockchain.
          </p>

          <h2>2. Platform Technology</h2>
          <p>
            SOBA Verse utilizes the following technologies:
          </p>
          <ul>
            <li>Next.js 13 for the web application framework</li>
            <li>Solana blockchain for NFT minting and transactions</li>
            <li>Replicate AI for image generation</li>
            <li>IPFS/NFT.Storage for decentralized storage</li>
            <li>Prisma with NeonDB for database management</li>
            <li>Vercel for deployment and hosting</li>
          </ul>

          <h2>3. Services</h2>
          <p>
            Our platform provides:
          </p>
          <ul>
            <li>AI-powered image generation using state-of-the-art models</li>
            <li>NFT minting on the Solana blockchain</li>
            <li>Custom SOBA frame overlays and artwork enhancement</li>
            <li>Wallet integration via Solana Wallet Adapter</li>
            <li>Community features and exclusive access</li>
          </ul>

          <h2>4. User Obligations</h2>
          <ul>
            <li>Connect a valid Solana wallet to use our services</li>
            <li>Maintain the security of your wallet and credentials</li>
            <li>Respect usage limits and fair platform usage</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Respect intellectual property rights</li>
          </ul>

          <h2>5. NFT Ownership & Rights</h2>
          <p>
            When you mint an NFT through SOBA Verse:
          </p>
          <ul>
            <li>You own the NFT on the Solana blockchain</li>
            <li>Ownership is verified through the Solana network</li>
            <li>NFTs are part of the official SOBA Verse collection (Collection Address: JBvMgUVSD9oQiwcfQx932CCbheaRpmiSFoLpESwzGeyn)</li>
            <li>Each NFT includes metadata stored on IPFS</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            SOBA Verse retains all rights to:
          </p>
          <ul>
            <li>The SOBA Verse platform and its codebase</li>
            <li>Our AI image generation technology and prompts</li>
            <li>SOBA frame designs and overlay elements</li>
            <li>Brand assets, logos, and visual identity</li>
            <li>The SOBA Verse collection smart contract</li>
          </ul>

          <h2>7. Generated Content Rights</h2>
          <p>
            For AI-generated images:
          </p>
          <ul>
            <li>You receive a license to use the generated artwork as an NFT</li>
            <li>The base AI model remains under Replicate's terms</li>
            <li>SOBA Verse overlays and enhancements remain our property</li>
            <li>Commercial rights are granted to NFT holders per our License Agreement</li>
          </ul>

          <h2>8. Technical Limitations</h2>
          <p>
            Users acknowledge:
          </p>
          <ul>
            <li>Generation limits of 5 images per wallet per day</li>
            <li>Solana network fees for minting operations</li>
            <li>Processing time for AI generation</li>
            <li>Storage limitations on IPFS</li>
          </ul>

          <h2>9. Updates and Modifications</h2>
          <p>
            SOBA Verse reserves the right to:
          </p>
          <ul>
            <li>Update the platform and its features</li>
            <li>Modify these terms with notice</li>
            <li>Adjust generation limits and parameters</li>
            <li>Enhance AI models and frame designs</li>
          </ul>

          <h2>10. Contact</h2>
          <p>
            For questions about these terms or our services, contact us at legal@sobaverse.com
          </p>
        </div>
      </div>
    </Layout>
  );
} 