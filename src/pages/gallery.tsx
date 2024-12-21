import Layout from '../components/Layout';
import NFTGallery from '../components/NFTGallery';

export default function Gallery() {
  return (
    <Layout>
      <div className="responsive-container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-[#ff8533]">
            Community Gallery
          </h1>
          <p className="text-gray-400">
            Explore amazing AI-generated NFTs created by the SOBA Verse community
          </p>
        </div>

        <NFTGallery />
      </div>
    </Layout>
  );
} 