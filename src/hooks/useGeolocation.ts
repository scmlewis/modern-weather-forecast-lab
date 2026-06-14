import { useRef, useState } from 'react';
import type { Coordinates } from '../types/weather';

export const useGeolocation = () => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const clearGeoError = () => setGeoError(null);

  const getFriendlyGeoError = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      return 'Location access is blocked. Search for a city or enable location permission in your browser.';
    }

    if (error.code === error.POSITION_UNAVAILABLE) {
      return 'Your current location is unavailable. Try searching for a city instead.';
    }

    if (error.code === error.TIMEOUT) {
      return 'Location lookup timed out. Try again or search by city.';
    }

    return 'Unable to use your current location right now.';
  };

  const getLocation = () =>
    new Promise<Coordinates>((resolve, reject) => {
      if (pendingRef.current) {
        reject(new Error('Location request already in progress.'));
        return;
      }

      if (!navigator.geolocation) {
        const message = 'Geolocation is not supported by this browser.';
        setGeoError(message);
        reject(new Error(message));
        return;
      }

      pendingRef.current = true;
      setIsLocating(true);
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          pendingRef.current = false;
          setIsLocating(false);
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          pendingRef.current = false;
          const message = getFriendlyGeoError(error);
          setIsLocating(false);
          setGeoError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });

  return { getLocation, isLocating, geoError, clearGeoError };
};
