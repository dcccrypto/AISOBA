export async function applyOverlay(
  originalImageUrl: string, 
  overlayPath: string = '/nft/nftoverlay.png'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    const overlay = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw original image
      ctx.drawImage(image, 0, 0);

      // Draw overlay when it loads
      overlay.onload = () => {
        ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          reject(new Error('Failed to convert canvas to data URL'));
        }
      };

      overlay.onerror = (error) => {
        console.error('Failed to load overlay image:', error);
        reject(new Error('Failed to load overlay image'));
      };

      // Set overlay source after setting onload handler
      overlay.crossOrigin = 'anonymous';
      overlay.src = overlayPath;
    };

    image.onerror = (error) => {
      console.error('Failed to load original image:', error);
      reject(new Error(`Failed to load original image: ${originalImageUrl}`));
    };

    // Set image source after setting onload handler
    image.crossOrigin = 'anonymous';
    image.src = originalImageUrl;
  });
} 