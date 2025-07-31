from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.routes import analysis, companies, watchlist

app = FastAPI(
    title="Financial Analysis API",
    description="AI-powered fundamental analysis system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Financial Analysis API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(watchlist.router, prefix="/api/watchlist", tags=["watchlist"])