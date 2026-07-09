<div align="center">

# Modern Weather Dashboard

**A stunning, feature-rich weather dashboard built with React, TypeScript, and the free Open-Meteo API.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)

</div>

---

## Features

### Core Weather

- Real-time current weather with temperature, feels like, humidity, wind, and UV index
- 7-day weekly forecast with precipitation totals and max wind
- Hourly planning view with rain probability, wind speed, and feels-like values
- Interactive hourly temperature chart powered by Recharts
- Sunrise and sunset times

### Air Quality

- Live Air Quality Index (AQI) from Open-Meteo Air Quality API
- Color-coded health levels (Good → Hazardous)
- PM2.5, PM10, and Ozone breakdown
- Health recommendations based on current conditions

### Favorites & Search

- Save up to 8 favorite locations for instant access
- Smart search with autocomplete powered by Open-Meteo Geocoding
- Recent search history with one-click reload
- Browser geolocation support

### Weather Alerts

- Automatic severe weather warnings based on forecast data
- Wind advisories, extreme temperature alerts, heavy rain warnings
- UV index and visibility alerts
- Dismissible banners with severity indicators

### Design & UX

- Immersive weather-reactive animated backgrounds (rain, snow, fog, lightning, sun)
- Dynamic color gradients that match current conditions
- Glass-morphism UI with translucent cards
- Dark and light mode toggle
- Fully responsive for desktop, tablet, and mobile
- Auto-refresh with configurable intervals (5m, 10m, 15m)
- Settings for temperature units (°C/°F), wind speed units, and time display

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run e2e tests
npm run test:e2e
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Recharts | Interactive charts |
| Axios | HTTP client |
| Lucide React | Icon library |
| Playwright | E2E testing |

---

## API

This app uses the **free** [Open-Meteo API](https://open-meteo.com/) — no API key required.

| Endpoint | Purpose |
|----------|---------|
| `api.open-meteo.com/v1/forecast` | Weather forecast & current conditions |
| `geocoding-api.open-meteo.com/v1/search` | City search autocomplete |
| `air-quality-api.open-meteo.com/v1/air-quality` | Air quality data |

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AirQualityCard.tsx
│   ├── AlertBanner.tsx
│   ├── CurrentWeatherCard.tsx
│   ├── FavoritesBar.tsx
│   ├── ForecastDetails.tsx
│   ├── HourlyChart.tsx
│   └── ...
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API clients & caching
├── styles/              # Global styles
├── types/               # TypeScript definitions
└── utils/               # Helper functions
```

---

## License

MIT
