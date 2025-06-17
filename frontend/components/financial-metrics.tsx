"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"

interface FinancialData {
  symbol: string
  calendarYear: string
  period: string
  revenue: number
  netIncome: number
  grossProfit: number
  grossProfitRatio: number
  operatingIncome: number
  operatingIncomeRatio: number
  ebitda: number
  ebitdaratio: number
}

interface FinancialMetricsProps {
  ticker: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Generate fallback financial data
const getFallbackFinancialData = (ticker: string): FinancialData[] => {
  const baseData = {
    META: { revenue: 134902000000, netIncome: 39370000000, grossProfitRatio: 0.8108, operatingIncomeRatio: 0.2918 },
    AAPL: { revenue: 394328000000, netIncome: 99803000000, grossProfitRatio: 0.4531, operatingIncomeRatio: 0.3019 },
    TSLA: { revenue: 96773000000, netIncome: 14997000000, grossProfitRatio: 0.1928, operatingIncomeRatio: 0.0955 },
  }

  const companyData = baseData[ticker as keyof typeof baseData] || baseData.META

  return Array.from({ length: 4 }, (_, i) => {
    const quarterMultiplier = 0.22 + (i % 4) * 0.05
    const quarter = ["Q4", "Q3", "Q2", "Q1"][i]
    const year = (2024 - Math.floor(i / 4)).toString()

    return {
      symbol: ticker,
      calendarYear: year,
      period: quarter,
      revenue: Math.round(companyData.revenue * quarterMultiplier),
      netIncome: Math.round(companyData.netIncome * quarterMultiplier),
      grossProfit: Math.round(companyData.revenue * quarterMultiplier * companyData.grossProfitRatio),
      grossProfitRatio: companyData.grossProfitRatio,
      operatingIncome: Math.round(companyData.revenue * quarterMultiplier * companyData.operatingIncomeRatio),
      operatingIncomeRatio: companyData.operatingIncomeRatio,
      ebitda: Math.round(companyData.revenue * quarterMultiplier * (companyData.operatingIncomeRatio + 0.03)),
      ebitdaratio: companyData.operatingIncomeRatio + 0.03,
    }
  })
}

export default function FinancialMetrics({ ticker }: FinancialMetricsProps) {
  const [data, setData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/api/financials/${ticker}`)

        if (!response.ok) {
          throw new Error("Failed to fetch financial data")
        }

        const financialData = await response.json()
        if (Array.isArray(financialData) && financialData.length > 0) {
          setData(financialData.slice(0, 4))
        } else {
          throw new Error("No financial data available")
        }
      } catch (error) {
        console.error("Error fetching financial data:", error)
        // Use fallback data
        const fallbackData = getFallbackFinancialData(ticker)
        setData(fallbackData)
        setError("Using sample financial data")
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchFinancialData()
    }
  }, [ticker])

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-gray-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No financial data available</p>
        </CardContent>
      </Card>
    )
  }

  const latestData = data[0]
  const previousData = data[1]

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value?.toLocaleString()}`
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  const metrics = [
    {
      label: "Revenue",
      value: formatCurrency(latestData.revenue),
      growth: calculateGrowth(latestData.revenue, previousData?.revenue),
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Net Income",
      value: formatCurrency(latestData.netIncome),
      growth: calculateGrowth(latestData.netIncome, previousData?.netIncome),
      icon: TrendingUp,
      color: latestData.netIncome >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      label: "Gross Profit Margin",
      value: `${(latestData.grossProfitRatio * 100).toFixed(1)}%`,
      growth: calculateGrowth(latestData.grossProfitRatio, previousData?.grossProfitRatio),
      icon: Percent,
      color: "text-blue-400",
    },
    {
      label: "Operating Margin",
      value: `${(latestData.operatingIncomeRatio * 100).toFixed(1)}%`,
      growth: calculateGrowth(latestData.operatingIncomeRatio, previousData?.operatingIncomeRatio),
      icon: Percent,
      color: "text-purple-400",
    },
  ]

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Financial Metrics</CardTitle>
        <p className="text-sm text-gray-400">
          Latest Quarter: {latestData.period} {latestData.calendarYear}
          {error && <span className="text-yellow-400 ml-2">({error})</span>}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const isPositiveGrowth = metric.growth >= 0

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <div>
                    <p className="text-sm text-gray-400">{metric.label}</p>
                    <p className="text-lg font-semibold text-white">{metric.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`flex items-center space-x-1 ${isPositiveGrowth ? "text-green-400" : "text-red-400"}`}
                  >
                    {isPositiveGrowth ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {isPositiveGrowth ? "+" : ""}
                      {metric.growth.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">vs prev quarter</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
