# Stock Analytics API Startup Script
echo "🚀 Starting Stock Analytics API Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check for API key
if [ -z "$FMP_API_KEY" ]; then
    echo "⚠️  WARNING: FMP_API_KEY environment variable not set!"
    echo "   Get your free API key from: https://site.financialmodelingprep.com/"
    echo "   Set it with: export FMP_API_KEY=your_api_key_here"
    echo ""
    echo "   Using demo key for now (limited functionality)..."
fi

# Create logs directory
mkdir -p logs

# Start the server
echo "🌟 Starting FastAPI server..."
echo "📊 API Documentation: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/api/health"
echo "📋 Logs Directory: ./logs/"
echo ""

python main.py
