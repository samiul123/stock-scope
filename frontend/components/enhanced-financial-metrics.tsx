"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Percent, Award, Shield, Target } from "lucide-react"

interface KeyMetrics {
  symbol: string
  marketCap: number
  returnOnEquityTTM: number
  returnOnAssetsTTM: number
  currentRatioTTM: number
  earningsYieldTTM: number
  freeCashFlowYieldTTM: number
  evToSalesTTM: number
  evToEBITDATTM: number
}

interface FinancialScores {
  symbol: string
  altmanZScore: number
  piotroskiScore: number
  workingCapital: number
  totalAssets: number
  marketCap: number
  revenue: number
}

interface EnhancedFinancialMetricsProps {
  ticker: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function EnhancedFinancialMetrics({ ticker }: EnhancedFinancialMetricsProps) {
  const [keyMetrics, setKeyMetrics] = useState<KeyMetrics | null>(null)
  const [financialScores, setFinancialScores] = useState<FinancialScores | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch key metrics and financial scores in parallel
        const [metricsResponse, scoresResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/key-metrics/${ticker}`),
          fetch(`${API_BASE_URL}/api/financial-scores/${ticker}`),
        ])

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setKeyMetrics(metricsData)
        }

        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json()
          setFinancialScores(scoresData)
        }

        if (!metricsResponse.ok && !scoresResponse.ok) {
          throw new Error("Failed to fetch financial metrics")
        }
      } catch (error) {
        console.error("Error fetching financial data:", error)
        setError(error instanceof Error ? error.message : "Failed to load financial metrics")
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchData()
    }
  }, [ticker])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Key Financial Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-gray-700" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Health Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-gray-700" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!keyMetrics && !financialScores) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <p className="text-gray-400 flex items-center justify-center">No financial data available</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value?.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const formatRatio = (value: number) => {
    return value?.toFixed(2)
  }

  const getScoreColor = (score: number, type: "altman" | "piotroski") => {
    if (type === "altman") {
      if (score > 3) return "text-green-400"
      if (score > 1.8) return "text-yellow-400"
      return "text-red-400"
    } else {
      if (score >= 8) return "text-green-400"
      if (score >= 6) return "text-yellow-400"
      return "text-red-400"
    }
  }

  const getScoreBadge = (score: number, type: "altman" | "piotroski") => {
    if (type === "altman") {
      if (score > 3) return { text: "Strong", variant: "default" as const }
      if (score > 1.8) return { text: "Moderate", variant: "secondary" as const }
      return { text: "Weak", variant: "destructive" as const }
    } else {
      if (score >= 8) return { text: "Excellent", variant: "default" as const }
      if (score >= 6) return { text: "Good", variant: "secondary" as const }
      return { text: "Poor", variant: "destructive" as const }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Key Financial Metrics */}
      {keyMetrics && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-400" />
              Key Financial Metrics (TTM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Market Cap</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(keyMetrics.marketCap)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Percent className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Return on Equity</p>
                    <p className="text-lg font-semibold text-white">{formatPercentage(keyMetrics.returnOnEquityTTM)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Percent className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Return on Assets</p>
                    <p className="text-lg font-semibold text-white">{formatPercentage(keyMetrics.returnOnAssetsTTM)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Current Ratio</p>
                    <p className="text-lg font-semibold text-white">{formatRatio(keyMetrics.currentRatioTTM)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-400">EV/Sales</p>
                  <p className="text-sm font-semibold text-white">{formatRatio(keyMetrics.evToSalesTTM)}</p>
                </div>
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-400">EV/EBITDA</p>
                  <p className="text-sm font-semibold text-white">{formatRatio(keyMetrics.evToEBITDATTM)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Health Scores */}
      {financialScores && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              Financial Health Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Altman Z-Score */}
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">Altman Z-Score</span>
                  </div>
                  <Badge variant={getScoreBadge(financialScores.altmanZScore, "altman").variant}>
                    {getScoreBadge(financialScores.altmanZScore, "altman").text}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(financialScores.altmanZScore, "altman")}`}>
                    {financialScores.altmanZScore.toFixed(2)}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Bankruptcy Risk</p>
                    <p className="text-sm text-gray-300">
                      {financialScores.altmanZScore > 3
                        ? "Low"
                        : financialScores.altmanZScore > 1.8
                          ? "Moderate"
                          : "High"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Piotroski Score */}
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">Piotroski Score</span>
                  </div>
                  <Badge variant={getScoreBadge(financialScores.piotroskiScore, "piotroski").variant}>
                    {getScoreBadge(financialScores.piotroskiScore, "piotroski").text}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(financialScores.piotroskiScore, "piotroski")}`}>
                    {financialScores.piotroskiScore}/9
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Financial Strength</p>
                    <p className="text-sm text-gray-300">
                      {financialScores.piotroskiScore >= 8
                        ? "Excellent"
                        : financialScores.piotroskiScore >= 6
                          ? "Good"
                          : "Poor"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Capital */}
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Working Capital</span>
                  <span
                    className={`text-sm font-semibold ${financialScores.workingCapital >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {formatCurrency(financialScores.workingCapital)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
