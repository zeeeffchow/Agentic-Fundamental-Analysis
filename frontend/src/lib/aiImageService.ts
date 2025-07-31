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
    companyImages?: CompanyImages
  ): Promise<string> {
    // If we have AI-retrieved logo URLs, try them in order
    if (companyImages?.logo_urls?.length) {
      for (const logoUrl of companyImages.logo_urls) {
        try {
          const isValid = await this.validateImageUrl(logoUrl);
          if (isValid) return logoUrl;
        } catch {
          continue; // Try next URL
        }
      }
      
      // If all AI URLs fail, use AI-provided fallback
      if (companyImages.fallback_logo_url) {
        return companyImages.fallback_logo_url;
      }
    }

    // Final fallback
    return this.generateFallbackLogo(ticker);
  }

  /**
   * Get CEO photo from AI-retrieved data with smart fallbacks
   */
  static async getBestCEOPhoto(
    ceoName: string,
    companyImages?: CompanyImages
  ): Promise<string | null> {
    if (!ceoName) return null;

    // If we have AI-retrieved CEO photo URLs, try them in order
    if (companyImages?.ceo_photo_urls?.length) {
      for (const photoUrl of companyImages.ceo_photo_urls) {
        try {
          const isValid = await this.validateImageUrl(photoUrl);
          if (isValid) return photoUrl;
        } catch {
          continue; // Try next URL
        }
      }
    }

    // Try AI-provided CEO fallback
    if (companyImages?.fallback_ceo_url) {
      return companyImages.fallback_ceo_url;
    }

    // Generate final fallback
    return this.generateCEOFallback(ceoName);
  }

  /**
   * Quick validation check for image URLs
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true; // If no error thrown, assume it's valid
    } catch {
      return false;
    }
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