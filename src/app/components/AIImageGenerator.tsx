import { useState } from 'react';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export default function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateImage = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      onImageGenerated(data.imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
    }
    setGenerating(false);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl mb-4">Generate AI Image</h2>
      <textarea
        className="w-full p-2 border rounded"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your NFT..."
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={generateImage}
        disabled={generating}
      >
        {generating ? 'Generating...' : 'Generate Image'}
      </button>
    </div>
  );
} 