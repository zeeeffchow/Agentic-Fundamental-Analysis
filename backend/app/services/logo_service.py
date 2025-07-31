# backend/app/services/logo_service.py
import httpx
from typing import Optional
from ..config import settings

class LogoDevService:
    """
    Provides helper methods for building Logo.dev image URLs and searching domains.
    """

    BASE_URL = "https://img.logo.dev"
    SEARCH_URL = "https://api.logo.dev/search"

    @classmethod
    def get_logo_url(
        cls,
        domain: str,
        size: int = 128,
        format: str = "png",
        greyscale: bool = False,
        retina: bool = False,
        fallback: str = "monogram",
    ) -> str:
        """
        Build a Logo.dev image URL for a given domain.  Parameters follow the
        official docs: size defaults to 128 px:contentReference[oaicite:0]{index=0},
        format can be 'png', 'jpg' or 'webp', and greyscale/theme/retina/fallback
        are optional.
        """
        url = f"{cls.BASE_URL}/{domain}"
        params = []

        # Include your public API token if provided to avoid rate limits:contentReference[oaicite:1]{index=1}.
        if settings.LOGODEV_API_KEY:
            params.append(f"token={settings.LOGODEV_API_KEY}")

        params.append(f"size={size}")

        if format and format != "png":
            params.append(f"format={format}")

        if greyscale:
            params.append("greyscale=true")

        if retina:
            params.append("retina=true")

        if fallback and fallback != "monogram":
            params.append(f"fallback={fallback}")

        if params:
            url += "?" + "&".join(params)

        return url

    @classmethod
    async def search_company_domain(cls, company_name: str) -> Optional[str]:
        """
        Use the Logo.dev Brand Search API to look up a domain from a company name.
        Requires LOGODEV_SECRET_KEY.  Returns the first domain or None.
        """
        secret = settings.LOGODEV_SECRET_KEY
        if not secret:
            return None

        headers = {
            "Authorization": f"Bearer {secret}"
        }
        params = {"q": company_name}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(cls.SEARCH_URL, headers=headers, params=params)
                response.raise_for_status()
                results = response.json()
                if results:
                    # Return the first domain in the results
                    return results[0].get("domain")
            except Exception:
                # Log or handle errors as needed
                return None

        return None
    
    @classmethod
    def get_ticker_logo_url(cls, ticker: str, size: int = 128, format: str = "png", **opts):
        return cls.get_logo_url(f"ticker/{ticker.lower()}", size=size, format=format, **opts)
