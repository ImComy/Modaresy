import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Expand, Minimize, Navigation, User, X } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
  return L.icon({
    iconUrl: svgDataUrl,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -45],
  });
};

const MapResizer = ({ isExpanded }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [isExpanded, map]);
  return null;
};

const LocationHandler = ({ mapInstanceRef }) => {
  const map = useMap();
  useEffect(() => {
    mapInstanceRef.current = map;
  }, [map, mapInstanceRef]);
  return null;
};

const TutorLocationMapDisplay = ({ tutor, className = '' }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const mapInstanceRef = useRef(null);
  const wrapperRef = useRef(null);

  const defaultCoordinates = [30.0444, 31.2357];

  const tutorCoordinates = useMemo(() => {
    if (tutor?.location_coordinates?.latitude && tutor?.location_coordinates?.longitude) {
      return [tutor.location_coordinates.latitude, tutor.location_coordinates.longitude];
    }
    return defaultCoordinates;
  }, [tutor]);

  const getUserLocation = (pan = false) => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(newLocation);
          if (pan && mapInstanceRef.current) {
            try {
              mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 13);
            } catch (err) {
              console.warn(t('unableToPan', 'Unable to pan map to user location:'), err);
            }
          }
        },
        (error) => {
          console.error(t('errorGettingLocation', 'Error getting user location:'), error);
          let errorMessage = t('locationAccessDenied', 'Could not access location.');
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = t('locationPermissionDenied', 'Location permission denied.');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = t('locationUnavailable', 'Position unavailable.');
          } else if (error.code === error.TIMEOUT) {
            errorMessage = t('locationTimeout', 'Location request timed out.');
          }
          setLocationError(errorMessage);
          setUserLocation({ lat: defaultCoordinates[0], lng: defaultCoordinates[1] });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError(t('geolocationNotSupported', 'Geolocation not supported by this browser.'));
      setUserLocation({ lat: defaultCoordinates[0], lng: defaultCoordinates[1] });
    }
  };

  useEffect(() => {
    getUserLocation(false);
  }, []);

  useEffect(() => {
    const callInvalidate = () => {
      try {
        if (mapInstanceRef.current && typeof mapInstanceRef.current.invalidateSize === 'function') {
          setTimeout(() => mapInstanceRef.current.invalidateSize(), 80);
        }
      } catch (err) {}
    };

    let ro;
    try {
      ro = new ResizeObserver(callInvalidate);
      if (wrapperRef.current) ro.observe(wrapperRef.current);
    } catch (e) {}
    window.addEventListener('resize', callInvalidate);
    callInvalidate();
    return () => {
      window.removeEventListener('resize', callInvalidate);
      if (ro) ro.disconnect();
    };
  }, [mapInstanceRef]);

  const toggleExpand = () => setIsExpanded((s) => !s);
  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${tutorCoordinates[0]},${tutorCoordinates[1]}`;
    window.open(url, '_blank');
  };

  const tutorIcon = useMemo(() => createCustomIcon('#ef4444'), []);
  const userIcon = useMemo(() => createCustomIcon('#22c55e'), []);

  return (
    <div className={`relative ${className}`}>
      {!isExpanded && (
        <motion.div
          ref={wrapperRef}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg h-64 min-h-[16rem] relative"
          whileHover={{ scale: 1.02 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <MapContainer center={tutorCoordinates} zoom={13} className="w-full h-full rounded-xl" style={{ height: '16rem' }}>
            <LocationHandler mapInstanceRef={mapInstanceRef} />
            <TileLayer
              attribution={t('osmAttribution', '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={tutorCoordinates} icon={tutorIcon}>
              <Popup>{t('tutorLocation', { name: tutor?.name || t('tutor', 'Tutor') })}</Popup>
            </Marker>
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>{t('yourLocation', 'Your location')}</Popup>
              </Marker>
            )}
          </MapContainer>

          <div className="absolute top-4 right-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleExpand}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
              aria-label={t('expandMap', 'Expand map')}
            >
              <Expand className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openInMaps}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
              aria-label={t('openInGoogleMaps', 'Open in Google Maps')}
            >
              <Navigation className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => getUserLocation(true)}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
              aria-label={t('showMyLocation', 'Show my location')}
            >
              <User className="w-4 h-4" />
            </motion.button>
          </div>

          {locationError && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded-md text-xs">
              {locationError}
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" onClick={toggleExpand} />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              ref={wrapperRef}
              className="fixed inset-4 z-50 md:inset-20 lg:inset-40 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl"
            >
              <MapContainer center={tutorCoordinates} zoom={13} className="w-full h-full">
                <MapResizer isExpanded={isExpanded} />
                <LocationHandler mapInstanceRef={mapInstanceRef} />
                <TileLayer
                  attribution={t('osmAttribution', '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')}
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={tutorCoordinates} icon={tutorIcon}>
                  <Popup>{t('tutorLocation', { name: tutor?.name || t('tutor', 'Tutor') })}</Popup>
                </Marker>
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>{t('yourLocation', 'Your location')}</Popup>
                  </Marker>
                )}
              </MapContainer>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleExpand}
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
                aria-label={t('minimizeMap', 'Minimize map')}
              >
                <X className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openInMaps}
                className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span className="sm:hidden md:inline-block text-sm font-medium">{t('openInGoogleMaps', 'Open in Google Maps')}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => getUserLocation(true)}
                className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span className="sm:hidden md:inline-block text-sm font-medium">{t('showMyLocation', 'Show my location')}</span>
              </motion.button>

              {locationError && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded-md text-xs">
                  {locationError}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorLocationMapDisplay;
