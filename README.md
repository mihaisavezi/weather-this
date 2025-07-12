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
touch apps/backend/.env
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


### Features

- Autocomplete Search: Implement an autocomplete text input field that allows users
to type and search for cities. Fetch city suggestions based on the input and display
the weather for the selected city.
- Weather Display: Show current weather data, such as temperature, weather
condition (e.g., sunny, rainy), humidity, and wind speed.
- Error Handling: Handle cases where the browser blocks location access or if the
user inputs an invalid city name.
- UI Design: Create a simple, responsive UI to display weather data in an organized
way.
- Location Detection: Use the browser's Geolocation API to
automatically detect the user's location and fetch the weather for that location.

## ⚠️ Important Notes

- **API Key Required**: The app won't work without a valid OpenWeatherMap API key
- **CORS Configured**: Production apps are configured to work together across domain defined by FRONTEND_URL env variable


```javascript
// apps/backend/.env.example
OPENWEATHER_API_KEY=YOUR_API_KEY
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
PORT=3001
FRONTEND_URL=http://localhost:5173

// apps/frontend/.env.example
VITE_API_URL=http://localhost:3001
```

## Improvements

* make dev scripts run cross platform, right now tested only on Mac
* Frtonend Unit Testing: Add unit tests for critical components, especially around fetching
weather data and city search.
* Historical Data: Allow users to view weather data from the past few days.
* UI Enhancements: Add visual improvements such as icons for weather conditions
(e.g., sun, cloud, rain) or animations.
* Favorites: Allow users to save and view weather for their favorite cities.
