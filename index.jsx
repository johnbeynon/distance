import React, { useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';

export default function PostcodeTravelCalculator() {
  const [postcodes, setPostcodes] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTravelTimes = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    const postcodeList = postcodes
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (postcodeList.length === 0) {
      setError('Please enter at least one postcode');
      setLoading(false);
      return;
    }

    const newResults = [];

    for (const postcode of postcodeList) {
      try {
        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQyMTkzMmRkNjljYjQ5MWNhOGM3MDUyYzg4NDcxMTFjIiwiaCI6Im11cm11cjY0In0=&start=${encodeURIComponent(postcode)},UK&end=51.24249,-0.57834`
        );
        
        // Try alternative: use nominatim for geocoding + distance calculation
        const origin = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(postcode)},UK&limit=1`
        );
        const dest = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=GU1 4RR,UK&limit=1`
        );

        const originData = await origin.json();
        const destData = await dest.json();

        if (originData.length === 0 || destData.length === 0) {
          newResults.push({
            postcode,
            distance: 'Not found',
            travelTime: 'Not found',
            error: true
          });
          continue;
        }

        const originCoords = `${originData[0].lon},${originData[0].lat}`;
        const destCoords = `${destData[0].lon},${destData[0].lat}`;

        // Get route from OpenRouteService
        const routeResponse = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248dab09134b0b4a468a8fb073bc2b1ed6f&start=${originCoords}&end=${destCoords}`
        );

        if (routeResponse.ok) {
          const routeData = await routeResponse.json();
          const distance = (routeData.features[0].properties.segments[0].distance / 1609.34).toFixed(1); // Convert to miles
          const duration = Math.round(routeData.features[0].properties.segments[0].duration / 60); // Convert to minutes

          newResults.push({
            postcode,
            distance: `${distance} miles`,
            travelTime: `${duration} mins`,
            error: false
          });
        } else {
          newResults.push({
            postcode,
            distance: 'Error',
            travelTime: 'Error',
            error: true
          });
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (err) {
        newResults.push({
          postcode,
          distance: 'Error',
          travelTime: 'Error',
          error: true
        });
      }

      setResults([...newResults]);
    }

    setLoading(false);
  };

  const downloadCSV = () => {
    const csvContent = [
      'Postcode,Distance,Travel Time',
      ...results.map(r => `${r.postcode},${r.distance},${r.travelTime}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postcode-travel-times.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            UK Postcode Travel Time Calculator
          </h1>
          <p className="text-gray-600 mb-6">
            Calculate travel times and distances from postcodes to GU1 4RR
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your postcodes (one per line):
            </label>
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="SW1A 1AA&#10;M1 1AE&#10;B1 1AA"
              value={postcodes}
              onChange={(e) => setPostcodes(e.target.value)}
            />
          </div>

          <button
            onClick={calculateTravelTimes}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Travel Times'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Results</h2>
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={18} />
                  Download CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Postcode</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Distance</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Travel Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className={result.error ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2">{result.postcode}</td>
                        <td className="border border-gray-300 px-4 py-2">{result.distance}</td>
                        <td className="border border-gray-300 px-4 py-2">{result.travelTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {loading && (
                <p className="mt-4 text-sm text-gray-600">
                  Processing {results.length} of {postcodes.split('\n').filter(p => p.trim()).length} postcodes...
                </p>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This tool uses OpenStreetMap routing data. Processing is done one postcode at a time 
              to respect API limits, so it may take a moment for larger lists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}