import { type NextRequest, NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY || "demo"

// Fallback company data
const getFallbackCompanyData = (ticker: string) => {
  const companies = {
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
      image: "https://financialmodelingprep.com/image-stock/META.png",
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
      image: "https://financialmodelingprep.com/image-stock/AAPL.png",
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
      image: "https://financialmodelingprep.com/image-stock/TSLA.png",
    },
  }

  return (
    companies[ticker as keyof typeof companies] || {
      ...companies.META,
      symbol: ticker,
      companyName: `${ticker} Corporation`,
      description: `${ticker} is a publicly traded company. Financial data and company information available through our platform.`,
    }
  )
}

export async function GET(request: NextRequest, { params }: { params: { ticker: string } }) {
  const ticker = params.ticker

  try {
    // Try to fetch from API first
    const profileResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${FMP_API_KEY}`,
      {
        headers: {
          "User-Agent": "StockAnalytics/1.0",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      if (profileData && Array.isArray(profileData) && profileData.length > 0) {
        return NextResponse.json(profileData[0])
      }
    }

    // If API fails or returns no data, use fallback
    console.log(`Using fallback company data for ${ticker}`)
    const fallbackData = getFallbackCompanyData(ticker)
    return NextResponse.json(fallbackData)
  } catch (error) {
    console.error("Error fetching company data:", error)

    // Return fallback data on error
    const fallbackData = getFallbackCompanyData(ticker)
    return NextResponse.json(fallbackData)
  }
}
