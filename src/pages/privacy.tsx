import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="responsive-container py-12">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            At SOBA Verse, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Wallet addresses and transaction data</li>
            <li>Generated images and NFT metadata</li>
            <li>Usage data and analytics</li>
            <li>Communication preferences</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To process your transactions</li>
            <li>To improve our platform</li>
            <li>To communicate with you</li>
            <li>To prevent fraud</li>
          </ul>

          <h2>Data Storage and Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            Your data is stored securely on our servers and we use industry-standard encryption.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@sobaverse.com
          </p>
        </div>
      </div>
    </Layout>
  );
} 