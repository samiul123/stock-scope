"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface StockPrice {
  date: string
  close: number
  volume: number
  open: number
  high: number
  low: number
}

interface StockChartProps {
  ticker: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Generate fallback stock price data
const getFallbackStockPrices = (ticker: string): StockPrice[] => {
  const basePrice = ticker === "META" ? 340 : ticker === "AAPL" ? 190 : ticker === "TSLA" ? 250 : 200
  const data = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Generate realistic price movement
    const volatility = 0.03 // 3% daily volatility
    const trend = -0.001 // Slight downward trend
    const randomChange = (Math.random() - 0.5) * 2 * volatility
    const price = basePrice * (1 + trend * i + randomChange)

    data.push({
      date: date.toISOString().split("T")[0],
      close: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 50000000) + 10000000,
      open: Math.round(price * 1.01 * 100) / 100,
      high: Math.round(price * 1.02 * 100) / 100,
      low: Math.round(price * 0.98 * 100) / 100,
    })
  }

  return data
}

export default function StockChart({ ticker }: StockChartProps) {
  const [data, setData] = useState<StockPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/api/stock-prices/${ticker}`)

        if (!response.ok) {
          throw new Error("Failed to fetch stock prices")
        }

        const stockData = await response.json()
        setData(stockData)
      } catch (error) {
        console.error("Error fetching stock data:", error)
        // Use fallback data
        // const fallbackData = getFallbackStockPrices(ticker)
        // setData(fallbackData)
        setError(error instanceof Error ? error.message : "Failed to load stock prices")
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchStockData()
    }
  }, [ticker])

  if (loading) {
    return <Skeleton className="h-64 w-full bg-gray-700" />
  }

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400">No chart data available</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
          <p className="text-green-400 font-semibold">{`Price: $${payload[0].value.toFixed(2)}`}</p>
          {error && <p className="text-yellow-400 text-xs mt-1">{error}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#10B981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
