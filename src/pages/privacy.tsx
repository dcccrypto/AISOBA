import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="responsive-container py-12">
        <h1 className="text-3xl font-bold mb-8 text-white">SOBA Verse Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            At SOBA Verse, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, and protect your information when you use our AI-powered NFT generation platform on the Solana blockchain.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Blockchain Data</h3>
          <ul>
            <li>Solana wallet addresses</li>
            <li>On-chain transaction data</li>
            <li>NFT minting history</li>
            <li>Smart contract interactions</li>
          </ul>

          <h3>Platform Usage Data</h3>
          <ul>
            <li>AI-generated images and associated prompts</li>
            <li>Frame and overlay selections</li>
            <li>Generation attempts and success rates</li>
            <li>User preferences and settings</li>
          </ul>

          <h3>Technical Data</h3>
          <ul>
            <li>IP addresses and device information</li>
            <li>Browser type and version</li>
            <li>Connection timestamps</li>
            <li>Performance metrics</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <h3>Core Services</h3>
          <ul>
            <li>Process AI image generation requests</li>
            <li>Facilitate NFT minting on Solana</li>
            <li>Manage daily generation limits</li>
            <li>Store NFT metadata on IPFS</li>
            <li>Track collection ownership</li>
          </ul>

          <h3>Platform Improvement</h3>
          <ul>
            <li>Optimize AI model performance</li>
            <li>Enhance user experience</li>
            <li>Debug technical issues</li>
            <li>Analyze usage patterns</li>
          </ul>

          <h2>4. Data Storage and Security</h2>
          <h3>Infrastructure</h3>
          <ul>
            <li>NeonDB for relational data storage</li>
            <li>IPFS/NFT.Storage for decentralized content</li>
            <li>Vercel for application hosting</li>
            <li>Replicate for AI processing</li>
          </ul>

          <h3>Security Measures</h3>
          <ul>
            <li>End-to-end encryption for sensitive data</li>
            <li>Regular security audits</li>
            <li>Access control and monitoring</li>
            <li>Secure wallet connections</li>
          </ul>

          <h2>5. Third-Party Services</h2>
          <p>We integrate with the following services:</p>
          <ul>
            <li>Solana blockchain network</li>
            <li>Replicate AI for image generation</li>
            <li>NFT.Storage for decentralized storage</li>
            <li>Vercel for hosting and analytics</li>
          </ul>

          <h2>6. Your Rights and Controls</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your generated content history</li>
            <li>Request deletion of off-chain data</li>
            <li>Opt-out of non-essential communications</li>
            <li>Export your platform data</li>
          </ul>

          <h2>7. Data Retention</h2>
          <p>We retain data as follows:</p>
          <ul>
            <li>Blockchain data: Permanent (Solana ledger)</li>
            <li>Generated images: Permanent (IPFS)</li>
            <li>Usage logs: 90 days</li>
            <li>Analytics data: 12 months</li>
          </ul>

          <h2>8. Updates to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy to reflect changes in our practices or technology. 
            Significant changes will be communicated through our platform and require your acknowledgment.
          </p>

          <h2>9. Contact Information</h2>
          <p>
            For privacy-related inquiries, contact us at:
          </p>
          <ul>
            <li>Email: privacy@sobaverse.com</li>
            <li>Support: support@sobaverse.com</li>
          </ul>

          <p className="text-sm mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </Layout>
  );
} 