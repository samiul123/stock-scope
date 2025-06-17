"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp, BarChart3, DollarSign, Activity, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PopularStock {
  symbol: string
  name: string
  price: number
  change: number
  changesPercentage: number
}

// Fallback popular stocks for when backend is not available
const FALLBACK_POPULAR_STOCKS: PopularStock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.84, change: -2.16, changesPercentage: -1.13 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: 12.67, changesPercentage: 5.38 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 342.56, change: 8.23, changesPercentage: 2.46 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 138.21, change: -1.45, changesPercentage: -1.04 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 145.86, change: 2.34, changesPercentage: 1.63 },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.28, change: 15.67, changesPercentage: 1.82 },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function HomePage() {
  const [ticker, setTicker] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [backendError, setBackendError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPopularStocks()
  }, [])

  const fetchPopularStocks = async () => {
    try {
      setLoadingPopular(true)
      setBackendError(null)

      // Check if backend is available
      const healthResponse = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!healthResponse.ok) {
        throw new Error("Backend service unavailable")
      }

      // Fetch popular stocks
      const response = await fetch(`${API_BASE_URL}/api/popular-stocks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPopularStocks(data)
      } else {
        throw new Error(`API returned ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching popular stocks:", error)
      setBackendError("Backend service is not available. Using sample data.")
      setPopularStocks(FALLBACK_POPULAR_STOCKS)
    } finally {
      setLoadingPopular(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim()) return

    setIsLoading(true)
    router.push(`/company/${ticker.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-bold text-white">StockScope</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                Markets
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                Watchlist
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        {/* Backend Status Alert */}
        {backendError && (
          <div className="max-w-4xl mx-auto mb-8">
            <Alert className="bg-yellow-900/20 border-yellow-600">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                {backendError} To enable full functionality, start the FastAPI backend server.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Invest in your
            <span className="text-green-400"> future</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Get real-time stock data, advanced analytics, and insights to make informed investment decisions.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search stocks (e.g., AAPL, TSLA, META)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-6 py-2"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {/* Popular Stocks */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">
            {backendError ? "Popular Stocks" : "Most Active Stocks"}
          </h3>
          {loadingPopular ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {popularStocks.map((stock) => {
                const isPositive = stock.change >= 0
                return (
                  <Card
                    key={stock.symbol}
                    className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer"
                    onClick={() => router.push(`/company/${stock.symbol}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{stock.symbol}</h4>
                          <p className="text-sm text-gray-400 truncate">{stock.name}</p>
                        </div>
                        {isPositive ? (
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-400 rotate-180" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">${stock.price?.toFixed(2)}</span>
                        <span className={`text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                          {isPositive ? "+" : ""}
                          {stock.changesPercentage?.toFixed(2)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Backend Setup Instructions */}
        {backendError && (
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🚀 Start the Backend Server</h3>
                <div className="space-y-3 text-gray-300">
                  <p>To enable full functionality with real-time data, start the FastAPI backend:</p>
                  <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm">
                    <div className="text-green-400"># Navigate to backend directory</div>
                    <div>cd backend</div>
                    <div className="text-green-400 mt-2"># Install dependencies</div>
                    <div>pip install -r requirements.txt</div>
                    <div className="text-green-400 mt-2"># Set your FMP API key</div>
                    <div>export FMP_API_KEY=your_api_key_here</div>
                    <div className="text-green-400 mt-2"># Start the server</div>
                    <div>python main.py</div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Get your free API key from{" "}
                    <a
                      href="https://site.financialmodelingprep.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      Financial Modeling Prep
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Charts</h3>
              <p className="text-gray-400">Interactive price charts with technical indicators and historical data.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Financial Data</h3>
              <p className="text-gray-400">Comprehensive financial metrics and fundamental analysis.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-6 text-center">
              <Activity className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Data</h3>
              <p className="text-gray-400">Live market data and real-time price updates.</p>
            </CardContent>
          </Card>
        </div> */}
      </main>
    </div>
  )
}
