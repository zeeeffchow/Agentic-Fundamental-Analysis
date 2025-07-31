export interface CompanyImages {
  ticker: string;
  logo_urls: string[];
  ceo_photo_urls: string[];
  fallback_logo_url: string;
  fallback_ceo_url?: string;
  company_info?: {
    ticker: string;
    company_name: string;
    website_domain: string;
    logo_description: string;
    ceo_name?: string;
    ceo_description?: string;
    founded_year?: number;
    headquarters?: string;
    industry_sector?: string;
  };
}

export class AIImageService {
  /**
   * Get company logo from AI-retrieved data with smart fallbacks
   */
  static async getBestLogo(
    ticker: string,
    companyImages?: CompanyImages | null
  ): Promise<string> {
    // If we have AI-retrieved logo URLs, try them in order
    if (companyImages?.logo_urls?.length) {
      for (const logoUrl of companyImages.logo_urls) {
        try {
          const isValid = await this.validateImageUrl(logoUrl);
          if (isValid) {
            console.log(`✅ Using AI logo URL: ${logoUrl}`);
            return logoUrl;
          }
        } catch (error) {
          console.warn(`❌ Logo URL failed: ${logoUrl}`, error);
          continue; // Try next URL
        }
      }
      
      // If all AI URLs fail, use AI-provided fallback
      if (companyImages.fallback_logo_url) {
        console.log(`⚠️ Using AI fallback logo: ${companyImages.fallback_logo_url}`);
        return companyImages.fallback_logo_url;
      }
    }

    // Final fallback
    const finalFallback = this.generateFallbackLogo(ticker);
    console.log(`🔄 Using generated fallback logo: ${finalFallback}`);
    return finalFallback;
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
    const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', '06b6d4'];
    const color = colors[this.hashString(ticker) % colors.length];
    return `https://ui-avatars.com/api/?name=${ticker}&size=${size}&background=${color}&color=ffffff&bold=true`;
  }

  /**
   * Generate CEO fallback photo
   */
  static generateCEOFallback(ceoName: string, size: number = 128): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(ceoName)}&size=${size}&background=6366f1&color=ffffff&bold=true`;
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}