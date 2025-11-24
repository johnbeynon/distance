# UK Postcode Travel Time Calculator

A React application that calculates travel times and distances from UK postcodes to a destination (GU1 4RR).

## Features

- Calculate travel times and distances from multiple postcodes
- Bulk postcode processing (one per line)
- Export results to CSV
- Real-time progress tracking
- Error handling for invalid postcodes

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`.

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Deployment

The built files in the `dist` folder can be deployed to any static hosting service like:

- Vercel
- Netlify  
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

## API Usage

This application uses:
- OpenStreetMap Nominatim API for geocoding
- OpenRouteService API for routing calculations

## License

MIT