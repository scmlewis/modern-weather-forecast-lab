# Modern Weather Dashboard

A responsive React + TypeScript weather dashboard built with Vite, Tailwind CSS, Axios, Recharts, and the free Open-Meteo API.

## Features

- Search weather by city name
- Current weather cards for temperature, condition, humidity, wind, feels like, sunrise, and sunset
- 7-day weekly outlook with rain totals and max wind
- Hourly planning view with rain probability, wind, and feels-like values
- Hourly temperature chart with Recharts
- WMO weather-code icons
- Loading and error states
- Recent searches saved in `localStorage`
- Dark and light modes
- Responsive desktop/mobile layout
- Weather-aware gradient and animated ambient backgrounds
- Browser geolocation support
- Immersive weather-reactive animated backgrounds

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## API Notes

The app uses:

- Forecast/current endpoint: `https://api.open-meteo.com/v1/forecast`
- City search endpoint: `https://geocoding-api.open-meteo.com/v1/search`

No API key is required. Units are metric by default.

## Example Screenshots Description

- Desktop: a wide glass dashboard with search controls across the top, current weather on the left, metric cards and the planning outlook on the right, and a full-width hourly chart below.
- Mobile: stacked cards with large current temperature, compact recent search chips, tabbed hourly/weekly outlook rows, and the chart resized for smaller screens.
- Dark mode: deep weather-colored gradient background, translucent cards, bright chart accents, and high-contrast controls.
- Light mode: airy gradient background, soft glass panels, subtle borders, and readable muted text.
