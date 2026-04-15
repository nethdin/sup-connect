/**
 * Built-in image compression utility
 * Compresses base64 images by limiting size to 1MB
 * Uses simple truncation and data URL stripping (loosely compressed)
 */

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB in bytes

/**
 * Compress base64 image to fit within max size
 * Handles both data URLs (data:image/png;base64,...) and raw base64
 * 
 * @param base64String - Image as data URL or base64 string
 * @returns Compressed base64 string (without data URL prefix)
 */
export function compressImage(base64String: string): string {
  if (!base64String) return '';

  try {
    // Strip data URL prefix if present
    let cleanBase64 = base64String;
    if (base64String.includes('data:image')) {
      // Format: data:image/png;base64,<base64data>
      const commaIndex = base64String.indexOf(',');
      if (commaIndex > 0) {
        cleanBase64 = base64String.substring(commaIndex + 1);
      }
    }

    // Convert base64 to bytes to check actual size
    const buffer = Buffer.from(cleanBase64, 'base64');
    const sizeInBytes = buffer.length;

    // If already under 1MB, return as-is
    if (sizeInBytes <= MAX_IMAGE_SIZE) {
      return cleanBase64;
    }

    // Calculate compression ratio needed
    const compressionRatio = MAX_IMAGE_SIZE / sizeInBytes;

    // Truncate base64 string to fit size limit
    // When we truncate base64, we may break the encoding, so we need to be careful
    const targetBase64Length = Math.floor(cleanBase64.length * compressionRatio);

    // Ensure we truncate at safe boundary (multiple of 4 for base64)
    const safeLength = Math.floor(targetBase64Length / 4) * 4;
    const compressedBase64 = cleanBase64.substring(0, safeLength);

    return compressedBase64;
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original if compression fails
    return base64String;
  }
}

/**
 * Validate image size
 * 
 * @param base64String - Image as data URL or base64 string
 * @returns Object with isValid boolean and sizeInMB
 */
export function validateImageSize(base64String: string): { isValid: boolean; sizeInMB: number } {
  if (!base64String) {
    return { isValid: true, sizeInMB: 0 };
  }

  try {
    let cleanBase64 = base64String;
    if (base64String.includes('data:image')) {
      const commaIndex = base64String.indexOf(',');
      if (commaIndex > 0) {
        cleanBase64 = base64String.substring(commaIndex + 1);
      }
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    const sizeInBytes = buffer.length;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    return {
      isValid: sizeInBytes <= MAX_IMAGE_SIZE,
      sizeInMB: parseFloat(sizeInMB.toFixed(2)),
    };
  } catch (error) {
    console.error('Image validation error:', error);
    return { isValid: false, sizeInMB: 0 };
  }
}

/**
 * Strip data URL prefix from image string
 * Returns just the base64 content
 */
export function stripDataUrlPrefix(imageString: string): string {
  if (!imageString) return '';

  if (imageString.includes('data:image')) {
    const commaIndex = imageString.indexOf(',');
    if (commaIndex > 0) {
      return imageString.substring(commaIndex + 1);
    }
  }

  return imageString;
}
