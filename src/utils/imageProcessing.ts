export async function applyOverlay(originalImageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const image = new Image();
    const overlay = new Image();
    let loadedImages = 0;

    console.log('Starting image processing...');
    
    const checkAllLoaded = () => {
      loadedImages++;
      console.log(`Loaded ${loadedImages}/2 images`);
      
      if (loadedImages === 2) {
        try {
          canvas.width = image.width;
          canvas.height = image.height;
          
          // Draw original image
          ctx.drawImage(image, 0, 0);
          
          // Draw overlay with proper opacity
          ctx.globalAlpha = 1.0; // Ensure full opacity
          ctx.drawImage(overlay, 0, 0, image.width, image.height);
          
          const result = canvas.toDataURL('image/webp', 0.9);
          console.log('Overlay applied successfully');
          resolve(result);
        } catch (error) {
          console.error('Error during canvas operations:', error);
          reject(error);
        }
      }
    };

    // Set up image loading
    image.onload = checkAllLoaded;
    overlay.onload = checkAllLoaded;
    
    image.onerror = (error) => {
      console.error('Failed to load original image:', error);
      reject(new Error(`Failed to load original image: ${originalImageUrl}`));
    };

    overlay.onerror = (error) => {
      console.error('Failed to load overlay image:', error);
      reject(new Error('Failed to load overlay image'));
    };

    // Important: Set crossOrigin before setting src
    image.crossOrigin = 'anonymous';
    overlay.crossOrigin = 'anonymous';
    
    // Load the images
    image.src = originalImageUrl;
    overlay.src = '/nft/nftoverlay.png'; // This path is correct for Next.js public directory
  });
} 