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

    // Preload the image to check if it works
    const img = new Image();
    
    img.onload = () => {
      setCurrentUrl(url);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setCurrentUrl(fallbackUrl);
      setIsLoading(false);
      setHasError(true);
    };
    
    img.src = url;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url, fallbackUrl]);

  return { currentUrl, isLoading, hasError };
};