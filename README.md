# Weather App - Development \& Production Guide

## 🚀 Running the App in Development Mode

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended package manager)
- **OpenWeatherMap API Key** ([Get one free here](https://openweathermap.org/api))


### Quick Start

1. **Clone and Install Dependencies**

```bash
pnpm install
```

2. **Set Up Environment Variables**

```bash
# Create backend environment file
cp apps/backend/.env.example apps/backend/.env
```

Add your API key to `apps/backend/.env`:

```bash
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
PORT=3001
FRONTEND_URL=http://localhost:5173

```

3. **Start Backend & Frontend** 

```bash
pnpm run dev
```

### Access Development App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health


## 🌐 Production Apps

### Live Applications

- **Frontend (Vercel)**: https://weather-this-frontend.vercel.app
- **Backend API (Render)**: https://weather-this-backend.onrender.com


### API Endpoints

- **Weather Data**: `GET /api/weather?city={cityName}`
- **City Search**: `GET /api/cities?query={searchTerm}`
- **Health Check**: `GET /health`

## ⚠️ Important Notes

- **API Key Required**: The app won't work without a valid OpenWeatherMap API key
- **CORS Configured**: Production apps are configured to work together across domain defined by FRONTEND_URL env variable
