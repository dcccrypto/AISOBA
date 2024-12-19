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

    // Add error logging
    console.log('Starting image processing...');
    console.log('Original image URL:', originalImageUrl);
    console.log('Overlay path:', '/nft/nftoverlay.png');

    const checkAllLoaded = () => {
      loadedImages++;
      console.log(`Loaded ${loadedImages}/2 images`);
      
      if (loadedImages === 2) {
        try {
          console.log('Both images loaded, applying overlay...');
          console.log('Image dimensions:', image.width, 'x', image.height);
          
          canvas.width = image.width;
          canvas.height = image.height;
          
          // Draw original image
          ctx.drawImage(image, 0, 0);
          
          // Draw overlay
          ctx.drawImage(overlay, 0, 0, image.width, image.height);
          
          // Convert to base64
          const result = canvas.toDataURL('image/webp', 0.9);
          console.log('Overlay applied successfully');
          resolve(result);
        } catch (error) {
          console.error('Error during canvas operations:', error);
          reject(error);
        }
      }
    };

    image.onload = () => {
      console.log('Original image loaded successfully');
      checkAllLoaded();
    };

    overlay.onload = () => {
      console.log('Overlay image loaded successfully');
      checkAllLoaded();
    };

    image.onerror = (error) => {
      console.error('Failed to load original image:', error);
      reject(new Error(`Failed to load original image: ${originalImageUrl}`));
    };

    overlay.onerror = (error) => {
      console.error('Failed to load overlay image:', error);
      reject(new Error('Failed to load overlay image: /nft/nftoverlay.png'));
    };

    // Set crossOrigin before setting src
    image.crossOrigin = 'anonymous';
    overlay.crossOrigin = 'anonymous';
    
    // Load the images
    try {
      image.src = originalImageUrl;
      overlay.src = '/nft/nftoverlay.png';
    } catch (error) {
      console.error('Error setting image sources:', error);
      reject(error);
    }
  });
} 