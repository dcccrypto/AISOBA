import Layout from '../components/Layout';

export default function HowItWorks() {
  return (
    <Layout>
      <div className="responsive-container py-16">
        <h1 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
          Create Your SOBA Chimp PFP
        </h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <div className="mb-4 text-[#ff6b00]">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">1. Design Your Chimp</h3>
            <p className="text-gray-400">
              Use our AI-powered generator to create your unique SOBA chimpanzee. Customize traits and accessories to make it truly yours.
            </p>
          </div>

          <div className="card">
            <div className="mb-4 text-[#ff6b00]">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">2. Customize Your NFT</h3>
            <p className="text-gray-400">
              Select from our premium SOBA frames and customize your artwork. Preview how your NFT will look before minting.
            </p>
          </div>

          <div className="card">
            <div className="mb-4 text-[#ff6b00]">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">3. Join the Community</h3>
            <p className="text-gray-400">
              Mint your NFT and become part of the exclusive SOBA Verse community. Connect with other collectors and creators.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-white">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4 items-start">
              <div className="text-[#ff6b00]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">AI-Powered Chimp Generation</h3>
                <p className="text-gray-400">Advanced AI technology creates unique SOBA chimpanzee PFPs based on your customization choices.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="text-[#ff6b00]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Premium Frames</h3>
                <p className="text-gray-400">Exclusive SOBA frames to enhance your NFT and make it truly unique.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="text-[#ff6b00]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Solana Blockchain</h3>
                <p className="text-gray-400">Fast and efficient minting on the Solana blockchain with low transaction fees.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="text-[#ff6b00]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Community Access</h3>
                <p className="text-gray-400">Join an exclusive community of SOBA collectors and creators.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 