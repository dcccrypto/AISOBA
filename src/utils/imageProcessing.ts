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

    const checkAllLoaded = () => {
      loadedImages++;
      if (loadedImages === 2) {
        // Both images loaded
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Draw original image
        ctx.drawImage(image, 0, 0);
        
        // Draw overlay
        ctx.drawImage(overlay, 0, 0, image.width, image.height);
        
        // Convert to base64
        resolve(canvas.toDataURL('image/webp', 0.9));
      }
    };

    image.onload = checkAllLoaded;
    overlay.onload = checkAllLoaded;
    image.onerror = () => reject(new Error('Failed to load original image'));
    overlay.onerror = () => reject(new Error('Failed to load overlay image'));

    image.crossOrigin = 'anonymous';
    overlay.crossOrigin = 'anonymous';
    
    image.src = originalImageUrl;
    overlay.src = '/nft/nftoverlay.png'; // Make sure this overlay image exists in public folder
  });
} 