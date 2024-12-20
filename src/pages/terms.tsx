import Layout from '../components/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="responsive-container py-12">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using SOBA Verse, you agree to be bound by these Terms of Service 
            and all applicable laws and regulations.
          </p>

          <h2>2. NFT Generation and Ownership</h2>
          <p>
            When you generate and mint NFTs through our platform:
          </p>
          <ul>
            <li>You retain ownership of your generated NFTs</li>
            <li>You are responsible for any transaction fees</li>
            <li>We maintain a 5% royalty on secondary sales</li>
            <li>You agree not to generate inappropriate or illegal content</li>
          </ul>

          <h2>3. User Responsibilities</h2>
          <ul>
            <li>Maintain the security of your wallet</li>
            <li>Comply with all applicable laws</li>
            <li>Not engage in market manipulation</li>
            <li>Not use the service for illegal activities</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            The SOBA Verse platform, including its original content and features, 
            is owned by SOBA Verse and protected by international copyright, trademark, 
            and other intellectual property laws.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            SOBA Verse shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages resulting from your use of the service.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users 
            of any material changes via email or platform notification.
          </p>
        </div>
      </div>
    </Layout>
  );
} 