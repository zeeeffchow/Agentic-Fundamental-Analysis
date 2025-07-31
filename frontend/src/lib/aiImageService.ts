// frontend/src/lib/aiImageService.ts
import type { CompanyImages } from '../types/images';

export class AIImageService {
  private static LOGODEV_API_KEY = import.meta.env.VITE_LOGODEV_API_KEY;
  static async getBestLogo(
    ticker: string,
    companyImages?: CompanyImages | null
    ): Promise<string> {
        if (companyImages?.logo_urls?.length) {
            // Sort URLs: ones with the API token first
            const urlsToTry = [...companyImages.logo_urls].sort((a, b) => {
            const aHasToken = a.includes('token=');
            const bHasToken = b.includes('token=');
            if (aHasToken && !bHasToken) return -1;
            if (!aHasToken && bHasToken) return 1;
            return 0;
            });

            for (const logoUrl of urlsToTry) {
            try {
                const isValid = await this.validateImageUrl(logoUrl);
                if (isValid) {
                console.log(`✅ Using Logo.dev URL: ${logoUrl}`);
                return logoUrl;
                }
            } catch {
                continue;
            }
            }

            // Fall back to AI-provided fallback if nothing works
            if (companyImages.fallback_logo_url) {
                return companyImages.fallback_logo_url;
            }
        }

        // Final fallback
        return this.generateFallbackLogo(ticker);
    }

    private static generateLogoDevUrl(
        domain: string,
        size: number = 128,
        format: string = "png"
        ): string {
        let url = `https://img.logo.dev/${domain}`;
        const params: string[] = [];

        // Only append the token if it exists
        if (this.LOGODEV_API_KEY) {
            params.push(`token=${this.LOGODEV_API_KEY}`);
        }

        // Always specify size; Logo.dev defaults to 128 px:contentReference[oaicite:0]{index=0}, but it’s explicit here
        params.push(`size=${size}`);

        if (format && format !== "png") {
            params.push(`format=${format}`);
        }

        if (params.length > 0) {
            url += "?" + params.join("&");
        }

        return url;
    }


  /**
   * Get CEO photo from AI-retrieved data with smart fallbacks
   */
  static async getBestCEOPhoto(
    ceoName: string,
    companyImages?: CompanyImages | null
  ): Promise<string | null> {
    if (!ceoName) return null;

    // If we have AI-retrieved CEO photo URLs, try them in order
    if (companyImages?.ceo_photo_urls?.length) {
      for (const photoUrl of companyImages.ceo_photo_urls) {
        try {
          const isValid = await this.validateImageUrl(photoUrl);
          if (isValid) {
            console.log(`✅ Using AI CEO photo: ${photoUrl}`);
            return photoUrl;
          }
        } catch (error) {
          console.warn(`❌ CEO photo URL failed: ${photoUrl}`, error);
          continue; // Try next URL
        }
      }
    } else {
      console.warn(`⚠️ No CEO photo URLs found for ${ceoName}`);
    }

    // Try AI-provided CEO fallback
    if (companyImages?.fallback_ceo_url) {
      console.log(`🔄 Using AI CEO fallback: ${companyImages.fallback_ceo_url}`);
      return companyImages.fallback_ceo_url;
    }

    // Generate final fallback
    const finalFallback = this.generateCEOFallback(ceoName);
    console.log(`🔄 Using generated CEO fallback: ${finalFallback}`);
    return finalFallback;
  }

  /**
   * Better image URL validation using actual image loading
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000); // 3 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      // Handle CORS issues gracefully
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }

  /**
   * Generate fallback logo
   */
    static generateFallbackLogo(ticker: string, size: number = 128): string {
        // Use the dedicated ticker endpoint instead of treating the ticker as a domain
        return this.generateLogoDevUrl(`ticker/${ticker.toLowerCase()}`, size);
    }
  /**
   * Generate CEO fallback photo
   */
  static generateCEOFallback(ceoName: string, size: number = 128): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(ceoName)}&size=${size}&background=6366f1&color=ffffff&bold=true`;
  }


}

// Re-export the type for backwards compatibility
export type { CompanyImages };