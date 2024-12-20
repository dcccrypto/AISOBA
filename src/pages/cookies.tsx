import Layout from '../components/Layout';

export default function Cookies() {
  return (
    <Layout>
      <div className="responsive-container py-12">
        <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none">
          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit our website.
            They help us remember your preferences and improve your browsing experience.
          </p>

          <h2>How we use cookies</h2>
          <ul>
            <li>Essential cookies: Required for the website to function properly</li>
            <li>Analytics cookies: Help us understand how visitors use our site</li>
            <li>Preference cookies: Remember your settings and choices</li>
            <li>Marketing cookies: Used to deliver relevant advertisements</li>
          </ul>

          {/* Add more cookie policy content */}
        </div>
      </div>
    </Layout>
  );
} 