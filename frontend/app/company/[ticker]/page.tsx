"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Globe,
  AlertCircle,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import StockChart from "@/components/stock-chart"
import EnhancedFinancialMetrics from "@/components/enhanced-financial-metrics"
import GrowthProjectionsChart from "@/components/growth-projections-chart"

interface CompanyProfile {
  symbol: string
  companyName: string
  price: number
  changes: number
  changesPercentage: number
  currency: string
  exchangeShortName: string
  industry: string
  sector: string
  country: string
  marketCap: number
  beta: number
  volAvg: number
  mktCap: number
  lastDiv: number
  range: string
  exchange: string
  description: string
  ceo: string
  website: string
  image: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Fallback company data for demo purposes
const getFallbackCompanyData = (ticker: string): CompanyProfile => {
  const companies: Record<string, CompanyProfile> = {
    META: {
      symbol: "META",
      companyName: "Meta Platforms, Inc.",
      price: 342.56,
      changes: 8.23,
      changesPercentage: 2.46,
      currency: "USD",
      exchangeShortName: "NASDAQ",
      industry: "Internet Content & Information",
      sector: "Communication Services",
      country: "US",
      marketCap: 871234567890,
      beta: 1.23,
      volAvg: 15234567,
      mktCap: 871234567890,
      lastDiv: 0,
      range: "274.38-542.81",
      exchange: "NASDAQ Global Select",
      description:
        "Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide. It operates in two segments, Family of Apps and Reality Labs.",
      ceo: "Mark Zuckerberg",
      website: "https://www.meta.com",
      image: "", // Remove placeholder image URL
    },
    AAPL: {
      symbol: "AAPL",
      companyName: "Apple Inc.",
      price: 189.84,
      changes: -2.16,
      changesPercentage: -1.13,
      currency: "USD",
      exchangeShortName: "NASDAQ",
      industry: "Consumer Electronics",
      sector: "Technology",
      country: "US",
      marketCap: 2987654321098,
      beta: 1.29,
      volAvg: 45678901,
      mktCap: 2987654321098,
      lastDiv: 0.96,
      range: "164.08-199.62",
      exchange: "NASDAQ Global Select",
      description:
        "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company serves consumers, and small and mid-sized businesses; and the education, enterprise, and government markets.",
      ceo: "Timothy Cook",
      website: "https://www.apple.com",
      image: "", // Remove placeholder image URL
    },
    TSLA: {
      symbol: "TSLA",
      companyName: "Tesla, Inc.",
      price: 248.42,
      changes: 12.67,
      changesPercentage: 5.38,
      currency: "USD",
      exchangeShortName: "NASDAQ",
      industry: "Auto Manufacturers",
      sector: "Consumer Cyclical",
      country: "US",
      marketCap: 789123456789,
      beta: 2.34,
      volAvg: 89012345,
      mktCap: 789123456789,
      lastDiv: 0,
      range: "138.80-299.29",
      exchange: "NASDAQ Global Select",
      description:
        "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.",
      ceo: "Elon Musk",
      website: "https://www.tesla.com",
      image: "", // Remove placeholder image URL
    },
  }

  return (
    companies[ticker] || {
      ...companies.META,
      symbol: ticker,
      companyName: `${ticker} Corporation`,
      description: `${ticker} is a publicly traded company. Financial data and company information available through our platform.`,
      image: "", // Remove placeholder image URL
    }
  )
}

// Component for company logo with fallback
const CompanyLogo = ({ symbol, companyName, image }: { symbol: string; companyName: string; image?: string }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Don't try to load image if it's empty or a placeholder URL
  const shouldShowImage = image && image.trim() !== "" && !image.includes("placeholder.svg") && !imageError

  if (!shouldShowImage) {
    // Show icon fallback instead of trying to load placeholder
    return (
      <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
        <Building2 className="h-8 w-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
      {imageLoading && <Building2 className="h-8 w-8 text-gray-400" />}
      <img
        src={image || "/placeholder.svg"}
        alt={companyName}
        className={`w-full h-full object-cover ${imageLoading ? "hidden" : "block"}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
      />
    </div>
  )
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticker = params.ticker as string

  const [companyData, setCompanyData] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true)
        setError(null)
        setUsingFallback(false)

        const response = await fetch(`${API_BASE_URL}/api/company/${ticker}`)

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()
        setCompanyData(data)
      } catch (err) {
        console.error("Error fetching company data:", err)
        // Use fallback data
        const fallbackData = getFallbackCompanyData(ticker)
        setCompanyData(fallbackData)
        setUsingFallback(true)
        setError("Using sample data. Start the backend server for real-time data.")
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchCompanyData()
    }
  }, [ticker])

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap?.toLocaleString()}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`
    return volume?.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 bg-gray-800" />
            <Skeleton className="h-32 w-full bg-gray-800" />
            <Skeleton className="h-64 w-full bg-gray-800" />
          </div>
        </div>
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Company Not Found</h2>
            <p className="text-gray-400 mb-4">Unable to find data for ticker "{ticker}"</p>
            <Button onClick={() => router.push("/")} className="bg-green-500 hover:bg-green-600 text-white">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPositive = companyData.changes >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Backend Status Alert */}
        {/* {usingFallback && (
          <div className="mb-6">
            <Alert className="bg-yellow-900/20 border-yellow-600">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                {error} Charts and financial data may be limited.
              </AlertDescription>
            </Alert>
          </div>
        )} */}

        {/* Company Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <CompanyLogo
                symbol={companyData.symbol}
                companyName={companyData.companyName}
                image={companyData.image}
              />
              <div>
                <h1 className="text-3xl font-bold text-white">{companyData.companyName}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg text-gray-400">{companyData.symbol}</span>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {companyData.exchangeShortName}
                  </Badge>
                  {/* {usingFallback && (
                    <Badge variant="secondary" className="bg-yellow-900 text-yellow-300">
                      Sample Data
                    </Badge>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-2xl font-bold text-white">${companyData.price?.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Change</p>
                    <p className={`text-xl font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                      {isPositive ? "+" : ""}${companyData.changes?.toFixed(2)} ({isPositive ? "+" : ""}
                      {companyData.changesPercentage?.toFixed(2)}%)
                    </p>
                  </div>
                  {isPositive ? (
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-400" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Market Cap</p>
                    <p className="text-xl font-semibold text-white">{formatMarketCap(companyData.mktCap)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Volume</p>
                    <p className="text-xl font-semibold text-white">{formatVolume(companyData.volAvg)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <StockChart ticker={ticker} />
              </CardContent>
            </Card>
          </div>

          {/* Company Info */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Sector</p>
                  <p className="text-white font-medium">{companyData.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Industry</p>
                  <p className="text-white font-medium">{companyData.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Country</p>
                  <p className="text-white font-medium">{companyData.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">CEO</p>
                  <p className="text-white font-medium">{companyData.ceo}</p>
                </div>
                {companyData.website && (
                  <div>
                    <p className="text-sm text-gray-400">Website</p>
                    <a
                      href={companyData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Financial Analysis */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Financial Analysis</h2>
          <EnhancedFinancialMetrics ticker={ticker} />
        </div>

        {/* Growth Projections */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Growth Analysis</h2>
          <GrowthProjectionsChart ticker={ticker} />
        </div>

        {/* Company Description */}
        {companyData.description && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">About {companyData.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{companyData.description}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
