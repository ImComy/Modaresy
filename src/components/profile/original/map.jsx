// components/profile/TutorLocationMap.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Expand, Minimize, Navigation, User, X } from 'lucide-react';

// Fix for default icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon creation function
const createCustomIcon = (color, isUser = false) => {
  const svgString = isUser 
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M12 21c-3.5 0-6-3-6-6 0-1.5 1-3 3-3h6c2 0 3 1.5 3 3 0 3-2.5 6-6 6z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;
  
  // Create a data URL from the SVG string
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
  
  return L.icon({
    iconUrl: svgDataUrl,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -45],
  });
};

// Component to handle map resize when expanded
const MapResizer = ({ isExpanded }) => {
  const map = useMap();
  
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [isExpanded, map]);
  
  return null;
};

const TutorLocationMapDisplay = ({ tutor, className = '' }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Default coordinates (Cairo, Egypt)
  const defaultCoordinates = [30.0444, 31.2357];

  // Get tutor coordinates from the location_coordinates object
  const tutorCoordinates = useMemo(() => {
    if (tutor?.location_coordinates?.latitude && tutor?.location_coordinates?.longitude) {
      return [tutor.location_coordinates.latitude, tutor.location_coordinates.longitude];
    }
    return defaultCoordinates;
  }, [tutor]);

  // Get user's current location
  const getUserLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          
          // If we have a map instance, pan to the user's location
          if (mapInstance) {
            mapInstance.setView([newLocation.lat, newLocation.lng], 13);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          let errorMessage = t('locationAccessDenied');
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = t('locationPermissionDenied');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = t('locationUnavailable');
          } else if (error.code === error.TIMEOUT) {
            errorMessage = t('locationTimeout');
          }
          
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError(t('geolocationNotSupported'));
    }
  };

  useEffect(() => {
    // Try to get user location when component mounts
    getUserLocation();
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${tutorCoordinates[0]},${tutorCoordinates[1]}`;
    window.open(url, '_blank');
  };

  // Create custom icons
  const tutorIcon = useMemo(() => createCustomIcon('#ef4444'), []);
  const userIcon = useMemo(() => createCustomIcon('#22c55e', true), []);

  return (
    <div className={`relative ${className}`}>
      {/* Normal mode map */}
      {!isExpanded && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg h-64"
          whileHover={{ scale: 1.02 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <MapContainer
            center={tutorCoordinates}
            zoom={13}
            className="w-full h-full rounded-xl"
            whenCreated={(map) => setMapInstance(map)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Tutor marker */}
            <Marker position={tutorCoordinates} icon={tutorIcon}>
              <Popup>{t('tutorLocation', { name: tutor?.name || 'Tutor' })}</Popup>
            </Marker>
            
            {/* User location marker */}
            {userLocation && (
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={userIcon}
              >
                <Popup>{t('yourLocation')}</Popup>
              </Marker>
            )}
          </MapContainer>
          
          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-[1000]">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleExpand}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
              aria-label={t('expandMap')}
            >
              <Expand className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openInMaps}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
              aria-label={t('openInGoogleMaps')}
            >
              <Navigation className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={getUserLocation}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
              aria-label={t('showMyLocation')}
            >
              <User className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Error message */}
          {locationError && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded-md text-xs">
              {locationError}
            </div>
          )}
        </motion.div>
      )}

      {/* Expanded mode map (modal) */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={toggleExpand}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-4 z-50 md:inset-20 lg:inset-40 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl"
            >
              <MapContainer
                center={tutorCoordinates}
                zoom={13}
                className="w-full h-full"
                whenCreated={(map) => setMapInstance(map)}
              >
                <MapResizer isExpanded={isExpanded} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Tutor marker - ADDED BACK TO EXPANDED VIEW */}
                <Marker position={tutorCoordinates} icon={tutorIcon}>
                  <Popup>{t('tutorLocation', { name: tutor?.name || 'Tutor' })}</Popup>
                </Marker>
                
                {/* User location marker */}
                {userLocation && (
                  <Marker 
                    position={[userLocation.lat, userLocation.lng]} 
                    icon={userIcon}
                  >
                    <Popup>{t('yourLocation')}</Popup>
                  </Marker>
                )}
              </MapContainer>
              
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleExpand}
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center z-[1000]"
                aria-label={t('minimizeMap')}
              >
                <X className="w-5 h-5" />
              </motion.button>
              
              {/* Open in Google Maps button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openInMaps}
                className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-[1000]"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-sm font-medium">{t('openInGoogleMaps')}</span>
              </motion.button>
              
              {/* Show my location button in expanded view */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={getUserLocation}
                className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-[1000]"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{t('showMyLocation')}</span>
              </motion.button>
              
              {/* Error message */}
              {locationError && console.log(locationError)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorLocationMapDisplay;