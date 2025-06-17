"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3 } from "lucide-react"

interface AnalystEstimate {
  symbol: string
  date: string
  revenueAvg: number
  netIncomeAvg: number
  epsAvg: number
  numAnalystsRevenue: number
  numAnalystsEps: number
}

interface FinancialGrowth {
  symbol: string
  date: string
  fiscalYear: string
  period: string
  revenueGrowth: number
  netIncomeGrowth: number
  epsGrowth: number
}

interface GrowthProjectionsChartProps {
  ticker: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function GrowthProjectionsChart({ ticker }: GrowthProjectionsChartProps) {
  const [estimates, setEstimates] = useState<AnalystEstimate[]>([])
  const [historicalGrowth, setHistoricalGrowth] = useState<FinancialGrowth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch analyst estimates and historical growth in parallel
        const [estimatesResponse, growthResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/analyst-estimates/${ticker}?period=annual&limit=5`),
          fetch(`${API_BASE_URL}/api/financial-growth/${ticker}?period=FY&limit=5`),
        ])

        if (estimatesResponse.ok) {
          const estimatesData = await estimatesResponse.json()
          setEstimates(estimatesData)
        }

        if (growthResponse.ok) {
          const growthData = await growthResponse.json()
          setHistoricalGrowth(growthData)
        }

        if (!estimatesResponse.ok && !growthResponse.ok) {
          throw new Error("Failed to fetch growth projections")
        }
      } catch (error) {
        console.error("Error fetching growth data:", error)
        setError(error instanceof Error ? error.message : "Failed to load growth projections")
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
            <CardTitle className="text-white">Revenue Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-gray-700" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Growth Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!estimates.length && !historicalGrowth.length) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <p className="text-gray-400 flex items-center justify-center">No growth data available</p>
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
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value?.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // Prepare revenue projection data
  const revenueProjectionData = estimates
    .map((estimate) => ({
      year: new Date(estimate.date).getFullYear().toString(),
      revenue: estimate.revenueAvg / 1e9, // Convert to billions
      netIncome: estimate.netIncomeAvg / 1e9,
      analysts: estimate.numAnalystsRevenue,
    }))
    .reverse()

  // Prepare growth rates data
  const growthRatesData = historicalGrowth
    .map((growth) => ({
      year: growth.fiscalYear,
      revenueGrowth: growth.revenueGrowth * 100,
      netIncomeGrowth: growth.netIncomeGrowth * 100,
      epsGrowth: growth.epsGrowth * 100,
    }))
    .reverse()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-semibold" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("Growth")
                ? `${entry.value.toFixed(1)}%`
                : entry.name.includes("Revenue") || entry.name.includes("Income")
                  ? `$${entry.value.toFixed(1)}B`
                  : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Projections */}
      {estimates.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
              Revenue Projections
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                Analyst Estimates
              </Badge>
              <span className="text-sm text-gray-400">Based on {estimates[0]?.numAnalystsRevenue} analysts</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueProjectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}B`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend/>
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                  <Bar dataKey="netIncome" fill="#10B981" name="Net Income" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Rates */}
      {historicalGrowth.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
              Historical Growth Rates
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              Annual Growth %
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthRatesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenueGrowth"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Revenue Growth"
                    dot={{ fill: "#3B82F6", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netIncomeGrowth"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Net Income Growth"
                    dot={{ fill: "#10B981", r: 4 }}
                  />
                  {/* <Line
                    type="monotone"
                    dataKey="epsGrowth"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="EPS Growth"
                    dot={{ fill: "#F59E0B", r: 4 }}
                  /> */}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
