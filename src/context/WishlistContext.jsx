import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { studentService } from '@/api/student';
import { apiFetch } from '@/api/apiService';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistTutorsState, setWishlistTutorsState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await studentService.getWishlist();
      const ids = Array.isArray(response) ? response.map(String) : [];
      setWishlistIds(ids);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setWishlistIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWishlistTutors = useCallback(async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      setWishlistTutorsState([]);
      return;
    }

    try {
      const promises = ids.map(async (id) => {
        try {
          const [tutorData, subjectsResponse] = await Promise.all([
            apiFetch(`/tutors/loadTutor/${id}`),
            apiFetch(`/subjects/load/${id}`)
          ]);

          let tutor = tutorData?.tutor || tutorData || null;
          if (!tutor) return null;

          if (tutor._id && !tutor.id) tutor.id = String(tutor._id);
          if (tutor.id && !tutor._id) tutor._id = String(tutor.id);

          const baseSubjects = subjectsResponse?.data?.baseSubjects || [];
          const subjectProfiles = subjectsResponse?.data?.subjectProfiles || [];
          const profileMap = new Map();
          subjectProfiles.forEach(profile => {
            if (profile.subject_id?._id) {
              profileMap.set(profile.subject_id._id.toString(), profile);
            }
          });

          const mergedSubjects = baseSubjects.map(subject => {
            const profile = profileMap.get(subject._id.toString());
            return {
              ...subject,
              ...(profile || {}),
              profileId: profile?._id,
              _id: subject._id
            };
          });

          tutor.subjects = mergedSubjects;

          if (Array.isArray(subjectProfiles) && subjectProfiles.length) {
            tutor.subject_profiles = subjectProfiles.map(p => {
              if (p && p.subject_id && typeof p.subject_id === 'object') {
                const copy = { ...p };
                copy.subject_doc = p.subject_id;
                return copy;
              }
              return p;
            }).filter(Boolean);
          } else {
            tutor.subject_profiles = tutor.subject_profiles || [];
          }

          tutor.name = tutor.name || 'Unknown Tutor';
          tutor.img = tutor.img || '';
          tutor.bannerimg = tutor.bannerimg || '';
          tutor.location = tutor.location || '';
          tutor.experience_years = tutor.experience_years || 0;

          return tutor;
        } catch (err) {
          console.error(`Failed to fetch tutor ${id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      setWishlistTutorsState(results.filter(Boolean));
    } catch (err) {
      console.error('Failed to fetch wishlist tutors:', err);
      setWishlistTutorsState([]);
    }
  }, []);

  const addToWishlist = useCallback(async (tutorId) => {
    try {
      const id = String(tutorId);
      await studentService.addToWishlist(id);
      setWishlistIds(prev => [...(prev || []), id]);
    } catch (error) {
      console.error('Add to wishlist failed:', error);
      throw error;
    }
  }, []);

  const removeFromWishlist = useCallback(async (tutorId) => {
    try {
      const id = String(tutorId);
      await studentService.removeFromWishlist(id);
      setWishlistIds(prev => (prev || []).filter(existingId => existingId !== id));
    } catch (error) {
      console.error('Remove from wishlist failed:', error);
      throw error;
    }
  }, []);

  const isInWishlist = useCallback((tutorId) => {
    return (wishlistIds || []).includes(String(tutorId));
  }, [wishlistIds]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    fetchWishlistTutors(wishlistIds || []);
  }, [wishlistIds, fetchWishlistTutors]);

  const contextValue = {
    wishlistTutors: wishlistTutorsState,
    wishlistIds: wishlistIds || [],
    isLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};