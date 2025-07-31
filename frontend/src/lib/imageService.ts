// frontend/src/lib/imageService.ts
// Complete image service for company logos, CEO photos, and fallbacks

export interface CompanyImages {
  logo?: string;
  ceoPhoto?: string;
  fallbackLogo?: string;
}

export class ImageService {
  // Comprehensive domain mapping for major companies
  private static domainMap: { [key: string]: string } = {
    // Tech Giants
    'AAPL': 'apple.com',
    'GOOGL': 'google.com', 
    'GOOG': 'google.com',
    'MSFT': 'microsoft.com',
    'AMZN': 'amazon.com',
    'META': 'meta.com',
    'TSLA': 'tesla.com',
    'NVDA': 'nvidia.com',
    'NFLX': 'netflix.com',
    'ADBE': 'adobe.com',
    'CRM': 'salesforce.com',
    'ORCL': 'oracle.com',
    'IBM': 'ibm.com',
    'INTC': 'intel.com',
    'AMD': 'amd.com',
    'QCOM': 'qualcomm.com',
    'PYPL': 'paypal.com',
    'SQ': 'squareup.com',
    'UBER': 'uber.com',
    'LYFT': 'lyft.com',
    'SNAP': 'snap.com',
    'TWTR': 'twitter.com',
    'PINS': 'pinterest.com',
    'SPOT': 'spotify.com',
    'ZOOM': 'zoom.us',
    'SHOP': 'shopify.com',
    'ROKU': 'roku.com',
    
    // Financial
    'JPM': 'jpmorganchase.com',
    'BAC': 'bankofamerica.com',
    'WFC': 'wellsfargo.com',
    'GS': 'goldmansachs.com',
    'MS': 'morganstanley.com',
    'C': 'citigroup.com',
    'V': 'visa.com',
    'MA': 'mastercard.com',
    'BRK.A': 'berkshirehathaway.com',
    'BRK.B': 'berkshirehathaway.com',
    
    // Retail & Consumer
    'WMT': 'walmart.com',
    'TGT': 'target.com',
    'HD': 'homedepot.com',
    'LOW': 'lowes.com',
    'COST': 'costco.com',
    'NKE': 'nike.com',
    'SBUX': 'starbucks.com',
    'MCD': 'mcdonalds.com',
    'KO': 'coca-cola.com',
    'PEP': 'pepsi.com',
    'PG': 'pg.com',
    'JNJ': 'jnj.com',
    
    // Auto & Industrial
    'F': 'ford.com',
    'GM': 'gm.com',
    'GE': 'ge.com',
    'CAT': 'caterpillar.com',
    'BA': 'boeing.com',
    'MMM': '3m.com',
    
    // Healthcare & Pharma
    'UNH': 'unitedhealthgroup.com',
    'PFE': 'pfizer.com',
    'ABBV': 'abbvie.com',
    'TMO': 'thermofisher.com',
    'ABT': 'abbott.com',
    'CVS': 'cvshealth.com',
    
    // Energy
    'XOM': 'exxonmobil.com',
    'CVX': 'chevron.com',
    
    // International
    'BABA': 'alibaba.com',
    'TSM': 'tsmc.com',
    'ASML': 'asml.com',
    'NVO': 'novonordisk.com',
    'NESN': 'nestle.com',
    'SAP': 'sap.com',
    'TM': 'toyota.com',
    'SONY': 'sony.com',
    'NTT': 'ntt.com',
  };

  // CEO name to company mapping for better photo searches
  private static ceoCompanyMap: { [key: string]: string } = {
    'Tim Cook': 'Apple',
    'Sundar Pichai': 'Google',
    'Satya Nadella': 'Microsoft', 
    'Andy Jassy': 'Amazon',
    'Mark Zuckerberg': 'Meta Facebook',
    'Elon Musk': 'Tesla SpaceX',
    'Jensen Huang': 'NVIDIA',
    'Reed Hastings': 'Netflix',
    'Shantanu Narayen': 'Adobe',
    'Marc Benioff': 'Salesforce',
    'Safra Catz': 'Oracle',
    'Pat Gelsinger': 'Intel',
    'Lisa Su': 'AMD',
    'Cristiano Amon': 'Qualcomm',
    'Dan Schulman': 'PayPal',
    'Dara Khosrowshahi': 'Uber',
    'Evan Spiegel': 'Snapchat',
    'Daniel Ek': 'Spotify',
    'Jamie Dimon': 'JPMorgan Chase',
    'Brian Moynihan': 'Bank of America',
    'David Solomon': 'Goldman Sachs',
    'James Gorman': 'Morgan Stanley',
    'Doug McMillon': 'Walmart',
    'Brian Cornell': 'Target',
    'John Donahoe': 'Nike',
    'Howard Schultz': 'Starbucks',
    'James Quincey': 'Coca-Cola',
    'Warren Buffett': 'Berkshire Hathaway',
  };

  /**
   * Get company logo URL using Clearbit API
   * @param ticker Stock ticker symbol
   * @param companyName Optional company name for fallback domain generation
   * @returns Logo URL (Clearbit or fallback)
   */
  static getCompanyLogo(ticker: string, companyName?: string): string {
    const domain = this.getCompanyDomain(ticker, companyName);
    return `https://logo.clearbit.com/${domain}`;
  }

  /**
   * Get fallback logo using initials
   * @param ticker Stock ticker symbol
   * @param size Logo size in pixels (default: 128)
   * @returns Initials-based logo URL
   */
  static getFallbackLogo(ticker: string, size: number = 128): string {
    const colors = [
      '3b82f6', // blue
      '10b981', // emerald  
      'f59e0b', // amber
      'ef4444', // red
      '8b5cf6', // violet
      '06b6d4', // cyan
      'f97316', // orange
      'ec4899', // pink
    ];
    
    // Use ticker to consistently pick a color
    const colorIndex = this.hashString(ticker) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${ticker}&size=${size}&background=${backgroundColor}&color=ffffff&bold=true&format=png`;
  }

  /**
   * Get CEO photo from multiple sources
   * @param ceoName CEO's full name
   * @param ticker Optional ticker for context
   * @returns CEO photo URL or null if not found
   */
  static async getCEOPhoto(ceoName: string, ticker?: string): Promise<string | null> {
    if (!ceoName) return null;

    try {
      // Try Wikipedia first (most reliable for famous CEOs)
      const wikipediaPhoto = await this.getWikipediaPhoto(ceoName);
      if (wikipediaPhoto) return wikipediaPhoto;

      // Try with company context if available
      const companyContext = this.ceoCompanyMap[ceoName];
      if (companyContext) {
        const contextPhoto = await this.getWikipediaPhoto(`${ceoName} ${companyContext}`);
        if (contextPhoto) return contextPhoto;
      }

      // Try with ticker context
      if (ticker) {
        const tickerPhoto = await this.getWikipediaPhoto(`${ceoName} ${ticker}`);
        if (tickerPhoto) return tickerPhoto;
      }

      return null;
    } catch (error) {
      console.warn(`Failed to load CEO photo for ${ceoName}:`, error);
      return null;
    }
  }

  /**
   * Get CEO photo fallback (initials avatar)
   * @param ceoName CEO's name
   * @param size Avatar size in pixels (default: 128)
   * @returns Fallback avatar URL
   */
  static getCEOPhotoFallback(ceoName: string, size: number = 128): string {
    // Use the full name for UI Avatars API (it handles initials automatically)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(ceoName)}&size=${size}&background=6366f1&color=ffffff&bold=true&format=png`;
  }

  /**
   * Get all company images (logo + CEO photo)
   * @param ticker Stock ticker
   * @param companyName Company name
   * @param ceoName CEO name
   * @returns Promise with all image URLs
   */
  static async getCompanyImages(
    ticker: string, 
    companyName?: string, 
    ceoName?: string
  ): Promise<CompanyImages> {
    const logo = this.getCompanyLogo(ticker, companyName);
    const fallbackLogo = this.getFallbackLogo(ticker);
    const ceoPhoto = ceoName ? await this.getCEOPhoto(ceoName, ticker) : undefined;

    return {
      logo,
      fallbackLogo,
      ceoPhoto: ceoPhoto || undefined,
    };
  }

  /**
   * Validate if an image URL is accessible
   * @param url Image URL to validate
   * @returns Promise<boolean> indicating if image is accessible
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private static getCompanyDomain(ticker: string, companyName?: string): string {
    // Try mapped domain first
    const mappedDomain = this.domainMap[ticker.toUpperCase()];
    if (mappedDomain) return mappedDomain;

    // Fallback: generate domain from company name
    if (companyName) {
      const cleanName = companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '') // Remove spaces
        .replace(/(inc|corp|corporation|company|ltd|llc)$/i, ''); // Remove corporate suffixes
      
      return `${cleanName}.com`;
    }

    // Last resort: use ticker
    return `${ticker.toLowerCase()}.com`;
  }

  private static async getWikipediaPhoto(searchTerm: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'User-Agent': 'FinAnalyzer/1.0 (https://example.com/contact)', // Replace with your contact
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const thumbnail = data.thumbnail?.source;
      
      // Prefer higher quality images
      if (thumbnail) {
        // Try to get a larger version by modifying Wikipedia image URLs
        const largerImage = thumbnail.replace(/\/\d+px-/, '/256px-');
        return largerImage;
      }

      return null;
    } catch {
      return null;
    }
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export utility functions for easy use in components
export const getCompanyLogo = (ticker: string, companyName?: string) => 
  ImageService.getCompanyLogo(ticker, companyName);

export const getFallbackLogo = (ticker: string, size?: number) => 
  ImageService.getFallbackLogo(ticker, size);

export const getCEOPhoto = (ceoName: string, ticker?: string) => 
  ImageService.getCEOPhoto(ceoName, ticker);

export const getCEOPhotoFallback = (ceoName: string, size?: number) => 
  ImageService.getCEOPhotoFallback(ceoName, size);

export default ImageService;