from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import httpx
import os
import time
import logging
import sys
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import asyncio
from datetime import datetime, timedelta
import json

# Configure logging
def setup_logging():
    """Setup comprehensive logging configuration"""
    
    # Create logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            # Console handler
            logging.StreamHandler(sys.stdout),
            # File handler for all logs
            logging.FileHandler("logs/app.log"),
            # Separate file for errors
            logging.FileHandler("logs/error.log", mode='a')
        ]
    )
    
    # Create specific loggers
    app_logger = logging.getLogger("stock_analytics")
    api_logger = logging.getLogger("fmp_api")
    request_logger = logging.getLogger("requests")
    
    # Set levels
    app_logger.setLevel(logging.INFO)
    api_logger.setLevel(logging.DEBUG)
    request_logger.setLevel(logging.INFO)
    
    return app_logger, api_logger, request_logger

# Setup logging
app_logger, api_logger, request_logger = setup_logging()

app = FastAPI(
    title="Stock Analytics API", 
    version="2.0.0",
    description="Enhanced Financial Modeling Prep API integration for comprehensive stock analysis"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory for placeholder images if it doesn't exist
os.makedirs("static", exist_ok=True)

# Mount static files to serve placeholder images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Get FMP API key from environment
FMP_API_KEY = os.getenv("FMP_API_KEY", "demo")
FMP_BASE_URL = "https://financialmodelingprep.com/stable"

# Log startup information
app_logger.info("=" * 50)
app_logger.info("Enhanced Stock Analytics API Starting Up")
app_logger.info(f"FMP API Key: {'***' + FMP_API_KEY[-4:] if len(FMP_API_KEY) > 4 else 'demo'}")
app_logger.info(f"FMP Base URL: {FMP_BASE_URL}")
app_logger.info("=" * 50)

# Request logging middleware with filtering for static files
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests and responses, but filter out static file spam"""
    start_time = time.time()
    
    # Skip logging for static files to reduce noise
    if (request.url.path.endswith(('.svg', '.png', '.jpg', '.ico')) or 
        'placeholder' in request.url.path or
        request.url.path.startswith('/static')):
        response = await call_next(request)
        return response
    
    # Log request for non-static files
    request_logger.info(
        f"REQUEST: {request.method} {request.url} - "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        request_logger.info(
            f"RESPONSE: {request.method} {request.url} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s"
        )
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        request_logger.error(
            f"REQUEST ERROR: {request.method} {request.url} - "
            f"Error: {str(e)} - "
            f"Time: {process_time:.3f}s"
        )
        raise

# # Handle placeholder.svg requests specifically
# @app.get("/placeholder.svg")
# async def placeholder_svg(height: int = 64, width: int = 64):
#     """Return a simple SVG placeholder"""
#     svg_content = f'''<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
#         <rect width="{width}" height="{height}" fill="#374151"/>
#         <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="12">
#             {width}x{height}
#         </text>
#     </svg>'''
    
#     return JSONResponse(
#         content=svg_content,
#         media_type="image/svg+xml",
#         headers={"Cache-Control": "public, max-age=3600"}
#     )

# Pydantic models
class CompanyProfile(BaseModel):
    symbol: str
    companyName: str
    price: float
    changes: float
    changesPercentage: float
    currency: str
    exchangeShortName: str
    industry: str
    sector: str
    country: str
    marketCap: int
    beta: float
    volAvg: int
    mktCap: int
    lastDiv: float
    range: str
    exchange: str
    description: str
    ceo: str
    website: str
    image: str

class StockPrice(BaseModel):
    date: str
    price: float
    volume: int

class FinancialMetrics(BaseModel):
    symbol: str
    marketCap: int
    peRatio: float
    pegRatio: float
    returnOnEquity: float
    returnOnAssets: float
    currentRatio: float
    debtToEquity: float

class FinancialGrowth(BaseModel):
    symbol: str
    date: str
    period: str
    revenueGrowth: float
    netIncomeGrowth: float
    epsGrowth: float

class AnalystEstimates(BaseModel):
    symbol: str
    date: str
    revenueAvg: int
    netIncomeAvg: int
    epsAvg: float

async def make_fmp_request(endpoint: str, params: dict = None):
    """Make request to FMP API with comprehensive logging"""
    
    if params is None:
        params = {}
    
    # Add API key to params
    params["apikey"] = FMP_API_KEY
    
    url = f"{FMP_BASE_URL}/{endpoint}"
    
    api_logger.info(f"FMP API REQUEST: {endpoint}")
    
    start_time = time.time()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            request_time = time.time() - start_time
            
            api_logger.info(
                f"FMP API RESPONSE: {endpoint} - "
                f"Status: {response.status_code} - "
                f"Time: {request_time:.3f}s"
            )
            
            if response.status_code == 403:
                api_logger.error(f"FMP API 403 Forbidden: {endpoint} - Check API key and limits")
                raise HTTPException(status_code=403, detail="API access forbidden - check API key")
            
            response.raise_for_status()
            data = response.json()
            
            # Check for FMP error messages
            if isinstance(data, dict) and "Error Message" in data:
                api_logger.error(f"FMP API Error: {data['Error Message']}")
                raise HTTPException(status_code=400, detail=data["Error Message"])
            
            return data
            
        except httpx.HTTPStatusError as e:
            api_logger.error(f"FMP API HTTP ERROR: {endpoint} - Status: {e.response.status_code}")
            raise HTTPException(status_code=500, detail=f"FMP API error: {e.response.status_code}")
        except httpx.TimeoutException:
            api_logger.error(f"FMP API TIMEOUT: {endpoint}")
            raise HTTPException(status_code=504, detail="FMP API request timed out")
        except Exception as e:
            api_logger.error(f"FMP API ERROR: {endpoint} - {str(e)}")
            raise HTTPException(status_code=500, detail=f"API error: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    app_logger.info("Health check requested")
    return {
        "message": "Enhanced Stock Analytics API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "status": "healthy",
        "api_provider": "Financial Modeling Prep"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check with FMP API status"""
    app_logger.info("Detailed health check requested")
    
    health_status = {
        "api_status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "api_provider": "Financial Modeling Prep",
        "fmp_status": "unknown"
    }
    
    # Test FMP API connectivity
    try:
        test_response = await make_fmp_request("profile", {"symbol": "AAPL"})
        if test_response and len(test_response) > 0:
            health_status["fmp_status"] = "healthy"
            app_logger.info("FMP API health check: HEALTHY")
        else:
            health_status["fmp_status"] = "unhealthy"
            app_logger.warning("FMP API health check: UNHEALTHY")
    except Exception as e:
        health_status["fmp_status"] = "unhealthy"
        health_status["fmp_error"] = str(e)
        app_logger.error(f"FMP API health check: FAILED - {str(e)}")
    
    return health_status

@app.get("/api/popular-stocks")
async def get_popular_stocks():
    """Get popular/active stocks from FMP"""
    app_logger.info("Popular stocks requested")
    
    try:
        # Get most active stocks
        data = await make_fmp_request("most-actives")
        
        if data and len(data) > 0:
            popular_stocks = []
            for stock in data[:6]:  # Top 6 most active
                popular_stocks.append({
                    "symbol": stock.get("symbol", ""),
                    "name": stock.get("name", ""),
                    "price": stock.get("price", 0),
                    "change": stock.get("change", 0),
                    "changesPercentage": stock.get("changesPercentage", 0)
                })
            
            app_logger.info(f"Successfully returned {len(popular_stocks)} popular stocks")
            return popular_stocks
        
        # Fallback to hardcoded popular stocks if API fails
        fallback_stocks = [
            {"symbol": "AAPL", "name": "Apple Inc.", "price": 232.8, "change": 4.79, "changesPercentage": 2.10},
            {"symbol": "TSLA", "name": "Tesla Inc.", "price": 248.42, "change": 12.67, "changesPercentage": 5.38},
            {"symbol": "META", "name": "Meta Platforms Inc.", "price": 342.56, "change": 8.23, "changesPercentage": 2.46},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 138.21, "change": -1.45, "changesPercentage": -1.04},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 145.86, "change": 2.34, "changesPercentage": 1.63},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": 875.28, "change": 15.67, "changesPercentage": 1.82}
        ]
        
        app_logger.info("Using fallback popular stocks data")
        return fallback_stocks
        
    except Exception as e:
        app_logger.error(f"Error in get_popular_stocks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching popular stocks: {str(e)}")

@app.get("/api/company/{ticker}")
async def get_company_profile(ticker: str):
    """Get enhanced company profile using FMP profile API"""
    app_logger.info(f"Company profile requested for ticker: {ticker}")
    
    try:
        ticker_upper = ticker.upper()
        
        # Get company profile
        profile_data = await make_fmp_request("profile", {"symbol": ticker_upper})
        
        if not profile_data or len(profile_data) == 0:
            app_logger.warning(f"No company profile data found for ticker: {ticker_upper}")
            raise HTTPException(status_code=404, detail=f"Company {ticker_upper} not found")
        
        company = profile_data[0]
        
        # Build enhanced company profile
        company_data = {
            "symbol": company.get("symbol", ticker_upper),
            "companyName": company.get("companyName", ""),
            "price": float(company.get("price", 0)),
            "changes": float(company.get("change", 0)),
            "changesPercentage": float(company.get("changePercentage", 0)),
            "currency": company.get("currency", "USD"),
            "exchangeShortName": company.get("exchange", "NASDAQ"),
            "industry": company.get("industry", ""),
            "sector": company.get("sector", ""),
            "country": company.get("country", "US"),
            "marketCap": int(company.get("marketCap", 0)),
            "beta": float(company.get("beta", 1.0)),
            "volAvg": int(company.get("averageVolume", 0)),
            "mktCap": int(company.get("marketCap", 0)),
            "lastDiv": float(company.get("lastDividend", 0)),
            "range": company.get("range", ""),
            "exchange": company.get("exchangeFullName", ""),
            "description": company.get("description", ""),
            "ceo": company.get("ceo", ""),
            "website": company.get("website", ""),
            "image": company.get("image", ""),
            # Additional FMP-specific fields
            "employees": company.get("fullTimeEmployees", ""),
            "phone": company.get("phone", ""),
            "address": company.get("address", ""),
            "city": company.get("city", ""),
            "state": company.get("state", ""),
            "zip": company.get("zip", ""),
            "ipoDate": company.get("ipoDate", "")
        }
        
        app_logger.info(f"Successfully returned company profile for {ticker_upper}: {company_data['companyName']}")
        return company_data
        
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Unexpected error in get_company_profile for {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching company profile: {str(e)}")

@app.get("/api/stock-prices/{ticker}")
async def get_stock_prices(ticker: str, days: int = 30):
    """Get historical stock prices using FMP historical-price-eod/light API"""
    app_logger.info(f"Stock prices requested for ticker: {ticker}, days: {days}")
    
    try:
        ticker_upper = ticker.upper()
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get historical prices
        params = {
            "symbol": ticker_upper,
            "from": start_date.strftime("%Y-%m-%d"),
            "to": end_date.strftime("%Y-%m-%d")
        }
        
        data = await make_fmp_request("historical-price-eod/light", params)
        
        if not data or len(data) == 0:
            app_logger.warning(f"No stock price data found for ticker: {ticker_upper}")
            raise HTTPException(status_code=404, detail=f"Stock price data for {ticker_upper} not found")
        
        # Convert to our format
        historical_data = []
        for item in data:
            historical_data.append({
                "date": item.get("date", ""),
                "close": float(item.get("price", 0)),
                "volume": int(item.get("volume", 0)),
                "open": float(item.get("price", 0)),  # FMP light API only provides price
                "high": float(item.get("price", 0)),
                "low": float(item.get("price", 0))
            })
        
        # Sort by date (oldest first)
        historical_data.sort(key=lambda x: x["date"])
        
        app_logger.info(f"Successfully returned {len(historical_data)} price points for {ticker_upper}")
        return historical_data
        
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Unexpected error in get_stock_prices for {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching stock prices: {str(e)}")

@app.get("/api/key-metrics/{ticker}")
async def get_key_metrics(ticker: str):
    """Get key financial metrics TTM using FMP key-metrics-ttm API"""
    app_logger.info(f"Key metrics requested for ticker: {ticker}")
    
    try:
        ticker_upper = ticker.upper()
        
        # Get key metrics TTM
        data = await make_fmp_request("key-metrics-ttm", {"symbol": ticker_upper})
        
        if not data or len(data) == 0:
            app_logger.warning(f"No key metrics data found for ticker: {ticker_upper}")
            raise HTTPException(status_code=404, detail=f"Key metrics for {ticker_upper} not found")
        
        metrics = data[0]
        
        app_logger.info(f"Successfully returned key metrics for {ticker_upper}")
        return metrics
        
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Unexpected error in get_key_metrics for {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching key metrics: {str(e)}")

@app.get("/api/financial-scores/{ticker}")
async def get_financial_scores(ticker: str):
    """Get financial scores using FMP financial-scores API"""
    app_logger.info(f"Financial scores requested for ticker: {ticker}")
    
    try:
        ticker_upper = ticker.upper()
        
        # Get financial scores
        data = await make_fmp_request("financial-scores", {"symbol": ticker_upper})
        
        if not data or len(data) == 0:
            app_logger.warning(f"No financial scores data found for ticker: {ticker_upper}")
            raise HTTPException(status_code=404, detail=f"Financial scores for {ticker_upper} not found")
        
        scores = data[0]
        
        app_logger.info(f"Successfully returned financial scores for {ticker_upper}")
        return scores
        
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Unexpected error in get_financial_scores for {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching financial scores: {str(e)}")

@app.get("/api/financial-growth/{ticker}")
async def get_financial_growth(ticker: str, period: str = "FY", limit: int = 5):
    """Get financial growth data using FMP financial-growth API"""
    app_logger.info(f"Financial growth requested for ticker: {ticker}, period: {period}")
    
    try:
        ticker_upper = ticker.upper()
        
        # Get financial growth
        params = {
            "symbol": ticker_upper,
            "period": period,
            "limit": limit
        }
        
        data = await make_fmp_request("financial-growth", params)
        
        if not data or len(data) == 0:
            app_logger.warning(f"No financial growth data found for ticker: {ticker_upper}")
            raise HTTPException(status_code=404, detail=f"Financial growth data for {ticker_upper} not found")
        
        app_logger.info(f"Successfully returned {len(data)} financial growth records for {ticker_upper}")
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Unexpected error in get_financial_growth for {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching financial growth: {str(e)}")

@app.get("/api/analyst-estimates/{ticker}")
async def get_analyst_estimates(ticker: str, period: str = "annual", limit: int = 5):
    """Get analyst estimates using FMP analyst-estimates API"""
    app_logger.info(f"Analyst estimates requested for ticker: {ticker}, period: {period}")
    
    try:
        ticker_upper = ticker.upper()
        
        # Get analyst estimates
        params = {
            "symbol": ticker_upper,
            "period": period,
            "limit": limit,
            "page": 0
        }
        
        data = await make_fmp_request("analyst-estimates", params)
        
        if not data or len(data) == 0:
            app_logger.warning(f"No analyst estimates data found for ticker: {ticker_upper}")
            raise HTTPException(status_code=404, detail=f"Analyst estimates for {ticker_upper} not found")
        
        app_logger.info(f"Successfully returned {len(data)} analyst estimates for {ticker_upper}")
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Unexpected error in get_analyst_estimates for {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching analyst estimates: {str(e)}")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with logging"""
    app_logger.error(f"GLOBAL EXCEPTION: {request.method} {request.url} - Error: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Log startup completion"""
    app_logger.info("🚀 Enhanced Stock Analytics API startup completed successfully")
    app_logger.info(f"📊 API Documentation available at: http://localhost:8000/docs")
    app_logger.info(f"📋 Health check available at: http://localhost:8000/api/health")
    app_logger.info(f"🔑 Get your FMP API key at: https://site.financialmodelingprep.com/")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown"""
    app_logger.info("🛑 Enhanced Stock Analytics API shutting down")

if __name__ == "__main__":
    import uvicorn
    
    app_logger.info("Starting Enhanced Stock Analytics API server with FMP...")
    app_logger.info("Server configuration:")
    app_logger.info("  - Host: 0.0.0.0")
    app_logger.info("  - Port: 8000")
    app_logger.info("  - API Provider: Financial Modeling Prep")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        log_level="info",
        access_log=True
    )
