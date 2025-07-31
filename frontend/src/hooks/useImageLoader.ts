import { useState, useEffect } from 'react';

interface UseImageLoaderResult {
  currentUrl: string;
  isLoading: boolean;
  hasError: boolean;
}

export const useImageLoader = (
  url: string | null,
  fallbackUrl: string
): UseImageLoaderResult => {
  const [currentUrl, setCurrentUrl] = useState<string>(fallbackUrl);
  const [isLoading, setIsLoading] = useState(Boolean(url));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!url) {
      setCurrentUrl(fallbackUrl);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Create a new image element to test loading
    const img = new Image();
    
    // Set up success handler
    img.onload = () => {
      setCurrentUrl(url);
      setIsLoading(false);
      setHasError(false);
    };
    
    // Set up error handler
    img.onerror = () => {
      console.warn(`Failed to load image: ${url}`);
      setCurrentUrl(fallbackUrl);
      setIsLoading(false);
      setHasError(true);
    };
    
    // Add timeout for slow-loading images
    const timeout = setTimeout(() => {
      console.warn(`Image load timeout: ${url}`);
      setCurrentUrl(fallbackUrl);
      setIsLoading(false);
      setHasError(true);
    }, 5000); // 5 second timeout
    
    // Start loading the image
    img.src = url;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
      clearTimeout(timeout);
    };
  }, [url, fallbackUrl]);

  return { currentUrl, isLoading, hasError };
};