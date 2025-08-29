import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Star, MapPin, BookOpen, DollarSign, AlertTriangle, UserX } from 'lucide-react';
import Loader from '@/components/ui/loader';
import { useTranslation } from 'react-i18next';

delete L.Icon.Default.prototype._getIconUrl;

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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
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

const ErrorBanner = ({ message }) => (
  <Card className="max-w-md mx-auto mt-10 border-red-500/40 bg-red-50 dark:bg-red-950">
    <CardContent className="flex items-center gap-4 py-6 text-red-600 dark:text-red-300">
      <AlertTriangle className="w-6 h-6 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-base">Connection Error</h4>
        <p className="text-sm mt-1 text-red-500 dark:text-red-400">
          {message || 'An error occurred while connecting to the server. Please try again later.'}
        </p>
      </div>
    </CardContent>
  </Card>
);

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const processTutorData = (tutor, filters) => {
  const subjectList = Array.isArray(tutor?.subjects) && tutor.subjects.length
    ? tutor.subjects
    : (Array.isArray(tutor?.subject_profiles) && tutor.subject_profiles.length
      ? tutor.subject_profiles.map(p => ({
          ...p.subject_doc,
          profile: p,
          rating: p.rating ?? p.subject_doc?.rating,
          private_pricing: p.private_pricing ?? p.subject_doc?.private_pricing,
          group_pricing: p.group_pricing ?? p.subject_doc?.group_pricing,
        }))
      : []);

  const selectedSubject = subjectList.find(s => {
    const name = (s?.subject || s?.name || '').toString();
    const grade = (s?.grade || '').toString();
    return name === (filters?.subject ?? name) && grade === (filters?.grade ?? grade);
  }) || subjectList[0];

  const displayName = tutor?.name && tutor.name.length > 16 ? 
    tutor.name.slice(0, 15) + '...' : tutor?.name;

  const locationLabel = tutor?.governate
    ? `${tutor.governate}${tutor?.district ? ` - ${tutor.district}` : ''}`
    : tutor?.location || 'Unknown location';

  const price = (typeof selectedSubject?.price === 'number' && isFinite(selectedSubject.price))
    ? selectedSubject.price
    : (typeof tutor?.price === 'number' && isFinite(tutor.price) ? tutor.price : null);

  const rating = (typeof selectedSubject?.rating === 'number' && isFinite(selectedSubject.rating))
    ? selectedSubject.rating
    : (typeof tutor?.avgRating === 'number' && isFinite(tutor.avgRating) ? tutor.avgRating :
       (typeof tutor?.rating === 'number' && isFinite(tutor.rating) ? tutor.rating : null));

  const languages = (selectedSubject?.language && typeof selectedSubject.language === 'string')
    ? [selectedSubject.language]
    : (Array.isArray(selectedSubject?.language) ? selectedSubject.language.filter(Boolean) : 
      (Array.isArray(tutor?.languages) ? tutor.languages.slice(0) : []));

  const derivedSector = selectedSubject?.sector || selectedSubject?.Sector || tutor?.sector || 'General';
  const derivedEducationSystem = selectedSubject?.education_system || selectedSubject?.educationSystem || tutor?.education_system || null;

  return {
    ...tutor,
    displayName,
    locationLabel,
    price,
    rating,
    languages,
    derivedSector,
    derivedEducationSystem,
    selectedSubject: selectedSubject || {}
  };
};

const MapSearchPage = ({ tutors = [], filters, loading = false, error = null }) => {
  const { t } = useTranslation();
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [theme, setTheme] = useState('light');
  const [userLocation, setUserLocation] = useState([30.0444, 31.2357]); 
  const [tutorsWithDistance, setTutorsWithDistance] = useState([]);
  const [showContent, setShowContent] = useState(false);
  const [prevTutors, setPrevTutors] = useState(tutors);

  useEffect(() => {
    if (!loading && tutors) {
      setShowContent(true);
      setPrevTutors(tutors);
    } else if (loading) {
      const timer = setTimeout(() => {
        setShowContent(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, tutors]);

  const isMissingRequiredFilters = useMemo(() => {
    return !filters || filters.subject === 'none' || filters.grade === 'none';
  }, [filters]);

  const filteredTutors = useMemo(() => {
    if (!tutors || !Array.isArray(tutors)) {
      return [];
    }

    return tutors.filter(
      (tutor) =>
        Array.isArray(tutor.subjects) &&
        tutor.subjects.some(
          (s) =>
            s.subject === filters.subject &&
            s.grade === filters.grade &&
            (!filters.language || s.language === filters.language) &&
            (!filters.education_system || s.education_system === filters.education_system)
        )
    );
  }, [tutors, filters?.subject, filters?.grade, filters?.language, filters?.education_system]);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const tutorsWithDistances = filteredTutors
      .map((tutor) => {
        const processedTutor = processTutorData(tutor, filters);

        const pos = tutor.coordinates && tutor.coordinates.latitude != null && tutor.coordinates.longitude != null
          ? [tutor.coordinates.latitude, tutor.coordinates.longitude]
          : null;

        if (!pos) return null;

        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          pos[0],
          pos[1]
        );

        return {
          ...processedTutor,
          position: pos,
          distance: distance < 1
            ? `${Math.round(distance * 1000)}m`
            : `${distance.toFixed(1)}km`,
        };
      })
      .filter(Boolean);

    setTutorsWithDistance(tutorsWithDistances);
  }, [userLocation, filteredTutors, filters]);

  const formatPrice = (tutor) => {
    if (tutor.price == null) return '—';
    const curr = tutor.currency || tutor.currency_symbol || '$';
    return `${curr}${tutor.price}/hr`;
  };

  if (loading && !showContent) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full flex justify-center items-center">
        <div className="flex flex-col items-center gap-3 z-10 absolute">
          <Loader className="w-8 h-8 animate-spin text-primary" loadingText="Loading Tutors..."/>
        </div>
        <MapContainer center={userLocation} zoom={10} scrollWheelZoom={true} className="h-full w-full z-0 opacity-50">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <ErrorBanner message={error} />
        </div>
        <MapContainer center={userLocation} zoom={10} scrollWheelZoom={true} className="h-full w-full z-0 opacity-50">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    );
  }

  if (isMissingRequiredFilters) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Card className="max-w-md border-red-500/40 bg-red-50 dark:bg-red-950">
            <CardContent className="flex items-center gap-4 py-6 text-red-600 dark:text-red-300">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-base">
                  {t('missingFilters', 'Missing Required Filters')}
                </h4>
                <p className="text-sm mt-1 text-red-500 dark:text-red-400">
                  {t(
                    'selectSubjectGrade',
                    'Please select both a subject and grade to see tutor results.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <MapContainer center={userLocation} zoom={10} scrollWheelZoom={true} className="h-full w-full z-0 opacity-50">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    );
  }

  if (filteredTutors.length === 0) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Card className="max-w-md bg-muted/60 dark:bg-muted/40">
            <CardContent className="flex items-center gap-4 py-6 text-muted-foreground">
              <UserX className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-base">{t('noTutorsFound', 'No Tutors Found')}</h4>
                <p className="text-sm mt-1">
                  {t('tryChangingFilters', 'Try adjusting your filters to see results.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <MapContainer center={userLocation} zoom={10} scrollWheelZoom={true} className="h-full w-full z-0 opacity-50">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    );
  }

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
                      <h3 className="font-bold text-lg text-foreground">{tutor.displayName}</h3>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                        <p className="text-accent font-medium text-md">
                          {tutor.selectedSubject?.subject || filters?.subject || 'Unknown Subject'}
                        </p>
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
                      <span className="font-semibold text-xs text-foreground">
                        {tutor.rating ? tutor.rating.toFixed(1) : 'N/A'}
                      </span>
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
                      <Link to={`/tutor/${tutor.id}`}>View Details</Link>
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
                      <h3 className="text-lg font-bold text-card-foreground">{selectedTutor.displayName}</h3>
                      <div className="flex items-center justify-start mt-1 gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <p className="text-accent font-medium">
                          {selectedTutor.selectedSubject?.subject || filters?.subject || 'Unknown Subject'}
                        </p>
                      </div>

                      {/* Price in detail card */}
                      <div className="flex items-center mt-2">
                        <DollarSign className="h-4 w-4 text-primary mr-1" />
                        <span className="font-bold text-primary">{formatPrice(selectedTutor)}</span>
                      </div>
                      
                      <div className="flex items-center mt-2 space-x-2">
                        <Star className="h-4 w-4 text-secondary fill-current" />
                        <span className="text-muted-foreground font-medium">
                          {selectedTutor.rating ? selectedTutor.rating.toFixed(1) : 'N/A'}
                        </span>
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