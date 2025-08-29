import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Star, MapPin, BookOpen, DollarSign } from 'lucide-react';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;

// Create custom icon using the color schema with properly encoded SVG
const createCustomIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encodeURIComponent(color)}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;utf8,${svg}`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -45]
  });
};

const lightIcon = createCustomIcon('#2563eb');
const darkIcon = createCustomIcon('#3b82f6');

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

const mockTutors = [
  { 
    id: 1, 
    name: 'John Smith', 
    subject: 'English', 
    rating: 4.9, 
    reviews: 42,
    position: [30.6043, 32.2723], 
    price: 25,
    currency: '$'
  },
  { 
    id: 2, 
    name: 'Sarah Johnson', 
    subject: 'Mathematics', 
    rating: 4.8, 
    reviews: 38,
    position: [30.7444, 31.2357], 
    price: 30,
    currency: '$'
  },
  { 
    id: 3, 
    name: 'Michael Brown', 
    subject: 'Physics', 
    rating: 5.0, 
    reviews: 51,
    position: [31.2001, 29.9187], 
    price: 35,
    currency: '$'
  },
  { 
    id: 4, 
    name: 'Emily Davis', 
    subject: 'Chemistry', 
    rating: 4.9, 
    reviews: 29,
    position: [30.0131, 31.2089], 
    price: 28,
    currency: '$'
  },
];

// Function to get initials from name
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const MapSearchPage = () => {
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [theme, setTheme] = useState('light');
  const [userLocation, setUserLocation] = useState([30.0444, 31.2357]); // Default to Cairo
  const [tutorsWithDistance, setTutorsWithDistance] = useState([]);

  // Detect theme (simplified for demo)
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep default location if user denies location access
        }
      );
    }
  }, []);

  // Calculate distances for all tutors
  useEffect(() => {
    const tutorsWithDistances = mockTutors.map(tutor => {
      const distance = calculateDistance(
        userLocation[0], 
        userLocation[1], 
        tutor.position[0], 
        tutor.position[1]
      );
      
      return {
        ...tutor,
        distance: distance < 1 
          ? `${Math.round(distance * 1000)}m` 
          : `${distance.toFixed(1)}km`
      };
    });
    
    setTutorsWithDistance(tutorsWithDistances);
  }, [userLocation]);

  // Function to format price display
  const formatPrice = (tutor) => {
    return `${tutor.price}/hr`;
  };

  return (
    <>
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <MapContainer center={userLocation} zoom={10} scrollWheelZoom={true} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Add marker for user's location */}
          <Marker 
            position={userLocation} 
            icon={createCustomIcon('#22c55e')} // Green color for user location
          >
            <Popup>Your Location</Popup>
          </Marker>
          
          {tutorsWithDistance.map(tutor => (
            <Marker 
              key={tutor.id} 
              position={tutor.position} 
              icon={theme === 'dark' ? darkIcon : lightIcon}
              eventHandlers={{
                click: () => {
                  setSelectedTutor(tutor);
                },
              }}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="min-w-[260px] p-4 bg-popover border border-border rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden">
                  {/* Header with gradient accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent rounded-t-xl "></div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg text-foreground">{tutor.name}</h3>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                        <p className="text-accent font-medium text-md">{tutor.subject}</p>
                      </div>
                    </div>
                    <Avatar className="h-12 w-12 rounded-md border-2 border-accent/20 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-bold rounded-sm">
                        {getInitials(tutor.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Price information */}
                  <div className="flex items-center justify-between mb-2 py-2 px-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm text-primary">{formatPrice(tutor)}</span>
                    </div>
                  </div>
                  
                  {/* Rating and distance info */}
                  <div className="flex items-center justify-between mb-3 py-2 px-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="font-semibold text-xs text-foreground">{tutor.rating}</span>
                      <span className="text-xs text-muted-foreground">({tutor.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{tutor.distance}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border/50">
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-xs py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() => setSelectedTutor(tutor)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <AnimatePresence>
          {selectedTutor && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute bottom-4 right-4 z-10"
            >
              <Card className="w-80 bg-card/95 backdrop-blur-md border-border shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 rounded-md border-2 border-accent shadow-md">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold rounded-sm">
                        {getInitials(selectedTutor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-card-foreground">{selectedTutor.name}</h3>
                      <div className="flex items-center justify-start mt-1 gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <p className="text-accent font-medium">{selectedTutor.subject}</p>
                      </div>

                      {/* Price in detail card */}
                      <div className="flex items-center mt-2">
                        <DollarSign className="h-4 w-4 text-primary mr-1" />
                        <span className="font-bold text-primary">{formatPrice(selectedTutor)}</span>
                      </div>
                      
                      <div className="flex items-center mt-2 space-x-2">
                        <Star className="h-4 w-4 text-secondary fill-current" />
                        <span className="text-muted-foreground font-medium">{selectedTutor.rating}</span>
                        <span className="text-xs text-muted-foreground">({selectedTutor.reviews} reviews)</span>
                      </div>
                      
                      <div className="flex items-center mt-2 space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{selectedTutor.distance} away</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    asChild 
                    className="w-full mt-5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-all"
                  >
                    <Link to={`/tutor/${selectedTutor.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          background: hsl(var(--popover));
        }
      `}</style>
    </>
  );
};

export default MapSearchPage;