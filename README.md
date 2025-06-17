# 📊 Stock Analytics Demo

A comprehensive stock analysis platform built with **Next.js 15**, **FastAPI**, and **Financial Modeling Prep API**. This application provides real-time stock data, financial metrics, growth projections, and interactive charts for informed investment decisions.

![Stock Analytics Demo](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11-yellow?style=for-the-badge&logo=python)

## 🚀 Features

### 📈 **Real-Time Stock Data**
- Live stock prices and market data
- Historical price charts with interactive tooltips
- Market cap, volume, and trading statistics
- Support for major exchanges (NASDAQ, NYSE)

### 💰 **Financial Analysis**
- **Key Financial Metrics**: ROE, ROA, Current Ratio, Market Cap
- **Financial Health Scores**: Altman Z-Score, Piotroski Score
- **Quarterly Financial Data**: Revenue, Net Income, Profit Margins
- **Growth Analysis**: Revenue and earnings growth trends

### 📊 **Interactive Charts**
- **Price Charts**: 30-day historical price movements
- **Revenue Projections**: Analyst estimates with fallback data
- **Growth Rate Analysis**: Historical growth trends
- **Hover Effects**: Consistent styling across all charts

### 🎯 **Smart Fallback System**
- **Graceful Degradation**: Works without backend server
- **Sample Data**: Realistic fallback data for demo purposes
- **Clear Indicators**: Visual badges show data source (real vs sample)
- **Offline Mode**: Core functionality available without API

### 🎨 **Modern UI/UX**
- **Dark Theme**: Professional dark mode interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Smooth skeleton loading animations
- **Error Handling**: User-friendly error messages and recovery

### 🔍 **Company Information**
- Comprehensive company profiles
- Executive information (CEO, headquarters)
- Industry and sector classification
- Company descriptions and website links

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **Financial Modeling Prep API Key** (free tier available)

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd stock-analytics-demo
\`\`\`

### 2. Frontend Setup (Next.js)
\`\`\`bash
cd frontend
npm install
# or
yarn install
\`\`\`

### 3. Backend Setup (FastAPI)
\`\`\`bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 4. Environment Configuration

#### Get Your API Key
1. Visit [Financial Modeling Prep](https://site.financialmodelingprep.com/)
2. Sign up for a free account
3. Get your API key from the dashboard

#### Set Environment Variables
\`\`\`bash
# Backend (.env or export)
export FMP_API_KEY=your_api_key_here

# Frontend (optional - for custom API URL)
export NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

## 🚀 Running the Application

### Option 1: Full Stack (Recommended)

#### Terminal 1 - Start Backend Server
\`\`\`bash
cd backend
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
export FMP_API_KEY=your_api_key_here
python main.py
\`\`\`

The backend will start on: **http://localhost:8000**
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

#### Terminal 2 - Start Frontend
\`\`\`bash
cd frontend
npm run dev
# or
yarn dev
\`\`\`

The frontend will start on: **http://localhost:3000**

### Option 2: Frontend Only (Demo Mode)
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The application will work with fallback data when the backend is not available.

### Option 3: Docker (Backend)
\`\`\`bash
cd backend
docker-compose up -d
\`\`\`

## 📱 Usage

### 1. **Search for Stocks**
- Enter a stock ticker (e.g., AAPL, TSLA, META)
- Browse popular/active stocks on the homepage
- Click on any stock to view detailed analysis

### 2. **Analyze Company Data**
- View real-time price and market data
- Explore financial metrics and health scores
- Analyze revenue projections and growth trends
- Read company information and descriptions

### 3. **Interactive Charts**
- Hover over charts for detailed tooltips
- View 30-day price movements
- Analyze revenue and growth projections
- Compare historical performance

## 🔧 Configuration

### API Endpoints
The backend provides these key endpoints:

- \`GET /api/company/{ticker}\` - Company profile data
- \`GET /api/stock-prices/{ticker}\` - Historical stock prices
- \`GET /api/key-metrics/{ticker}\` - Financial metrics (TTM)
- \`GET /api/financial-scores/{ticker}\` - Health scores
- \`GET /api/analyst-estimates/{ticker}\` - Revenue projections
- \`GET /api/financial-growth/{ticker}\` - Growth analysis

### Fallback Data
When the backend is unavailable, the frontend uses realistic fallback data for:
- Popular stocks (AAPL, TSLA, META, etc.)
- Company profiles and basic information
- Historical price data (30-day simulation)
- Financial metrics and ratios
- Revenue projections with growth modeling

## 🎨 Customization

### Adding New Stock Tickers
Update fallback data in:
- \`frontend/app/api/company/[ticker]/route.ts\`
- \`frontend/app/api/financials/[ticker]/route.ts\`
- \`frontend/app/api/stock-prices/[ticker]/route.ts\`

### Styling and Themes
- Built with **Tailwind CSS** and **shadcn/ui**
- Dark theme optimized for financial data
- Consistent hover effects across all components
- Responsive design for all screen sizes

### Chart Customization
Charts use **Recharts** library with custom styling:
- Consistent color scheme
- Interactive tooltips
- Hover effects matching UI buttons
- Responsive containers

## 🐛 Troubleshooting

### Common Issues

#### Backend Not Starting
\`\`\`bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
\`\`\`

#### API Key Issues
\`\`\`bash
# Verify API key is set
echo $FMP_API_KEY

# Test API directly
curl "https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=YOUR_KEY"
\`\`\`

#### Frontend Build Issues
\`\`\`bash
# Clear Next.js cache
rm -rf .next
npm run build
\`\`\`

### Logs and Debugging
- Backend logs: \`backend/logs/\`
- Frontend console: Browser Developer Tools
- API documentation: http://localhost:8000/docs

## 📊 API Rate Limits

**Financial Modeling Prep Free Tier:**
- 250 requests per day
- Rate limiting handled gracefully
- Fallback data ensures functionality

**Upgrade Options:**
- Starter: $14/month (1,000 requests/day)
- Professional: $29/month (10,000 requests/day)
- Enterprise: Custom pricing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Financial Modeling Prep** for providing comprehensive financial data API
- **shadcn/ui** for beautiful, accessible UI components
- **Recharts** for powerful, customizable chart components
- **Next.js** team for the excellent React framework
- **FastAPI** for the high-performance Python web framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the [API documentation](http://localhost:8000/docs)
- Review the troubleshooting section above

---

**Built with ❤️ for the financial analysis community**
\`\`\`