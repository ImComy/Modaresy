import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, User, Save, RotateCcw } from 'lucide-react';
import {initializeFormData} from '@/data/formData';

// Fix for default icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon creation function
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

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const TutorLocationMapEdit = ({ tutor, onChange, className = '' }) => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Default coordinates (Cairo, Egypt)
  const defaultCoordinates = [30.0444, 31.2357];

  // Get coordinates from tutor data or use defaults
  const coordinates = useMemo(() => {
    if (tutor?.location_coordinates?.latitude && tutor?.location_coordinates?.longitude) {
      return {
        lat: tutor.location_coordinates.latitude,
        lng: tutor.location_coordinates.longitude
      };
    }
    return {
      lat: defaultCoordinates[0],
      lng: defaultCoordinates[1]
    };
  }, [tutor]);

  const [position, setPosition] = useState(coordinates);

  // Update position when tutor data changes
  useEffect(() => {
    setPosition(coordinates);
  }, [coordinates]);

  // Propagate position changes to parent
  useEffect(() => {
    if (!position) return;
    
    // Use the same onChange pattern as TutorProfileHeader
    onChange('location_coordinates', {
      latitude: position.lat,
      longitude: position.lng,
    });
  }, [position, onChange]);

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
          setPosition(newLocation);
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

  const handleSaveLocation = () => {
    if (position) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const resetLocation = () => {
    setPosition(coordinates);
  };

  // Create custom icons
  const tutorIcon = useMemo(() => createCustomIcon('#ef4444'), []);
  const selectedIcon = useMemo(() => createCustomIcon('#10b981'), []);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg ${className}`}>
      
      <div className="relative h-64">
        <MapContainer
          center={position || defaultCoordinates}
          zoom={13}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Selected location marker */}
          {position && (
            <Marker position={position} icon={selectedIcon} />
          )}
          
          {/* Location selection handler */}
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={getUserLocation}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
            aria-label={t('useMyLocation')}
          >
            <User className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetLocation}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md flex items-center justify-center"
            aria-label={t('resetLocation')}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TutorLocationMapEdit;