"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface RevenueData {
  period: string
  year: string
  revenue: number
  netIncome: number
}

interface RevenueChartProps {
  ticker: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Generate fallback revenue data
const getFallbackRevenueData = (ticker: string): RevenueData[] => {
  const baseData = {
    META: { revenue: 134902000000, netIncome: 39370000000 },
    AAPL: { revenue: 394328000000, netIncome: 99803000000 },
    TSLA: { revenue: 96773000000, netIncome: 14997000000 },
  }

  const companyData = baseData[ticker as keyof typeof baseData] || baseData.META

  return Array.from({ length: 8 }, (_, i) => {
    const quarterMultiplier = 0.22 + (i % 4) * 0.05
    const yearGrowth = 1 + Math.floor(i / 4) * 0.15
    const quarter = ["Q1", "Q2", "Q3", "Q4"][i % 4]
    const year = (2024 - Math.floor(i / 4)).toString()

    return {
      period: `${quarter} ${year}`,
      year,
      revenue: (companyData.revenue * quarterMultiplier * yearGrowth) / 1e9,
      netIncome: (companyData.netIncome * quarterMultiplier * yearGrowth) / 1e9,
    }
  }).reverse()
}

export default function RevenueChart({ ticker }: RevenueChartProps) {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/api/financials/${ticker}`)

        if (!response.ok) {
          throw new Error("Failed to fetch revenue data")
        }

        const financialData = await response.json()
        if (Array.isArray(financialData) && financialData.length > 0) {
          const revenueData = financialData
            .slice(0, 8)
            .reverse()
            .map((item: any) => ({
              period: `${item.period} ${item.calendarYear}`,
              year: item.calendarYear,
              revenue: item.revenue / 1e9,
              netIncome: item.netIncome / 1e9,
            }))
          setData(revenueData)
        } else {
          throw new Error("No revenue data available")
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error)
        // Use fallback data
        const fallbackData = getFallbackRevenueData(ticker)
        setData(fallbackData)
        setError("Using sample revenue data")
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchRevenueData()
    }
  }, [ticker])

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full bg-gray-700" />
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No revenue data available</p>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          <p className="text-blue-400 font-semibold">Revenue: ${payload[0].value.toFixed(2)}B</p>
          <p className="text-green-400 font-semibold">Net Income: ${payload[1].value.toFixed(2)}B</p>
          {error && <p className="text-yellow-400 text-xs mt-1">{error}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Revenue & Net Income Trend</CardTitle>
        <p className="text-sm text-gray-400">
          Last 8 quarters (in billions)
          {error && <span className="text-yellow-400 ml-2">({error})</span>}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}B`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
              <Bar dataKey="netIncome" fill="#10B981" name="Net Income" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
