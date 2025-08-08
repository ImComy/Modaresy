// src/context/WishlistContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { studentService } from '@/api/student';
import { mockTutors } from '@/data/enhanced';

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Safe getter for wishlist tutors
  const getWishlistTutors = useCallback(() => {
    if (!Array.isArray(wishlistIds)) return [];
    return mockTutors.filter(tutor => 
      wishlistIds.includes(String(tutor._id || tutor.id))
    ) || [];
  }, [wishlistIds]);

  // Fetch wishlist from backend
const fetchWishlist = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await studentService.getWishlist();
    // Ensure we have an array of strings
    const ids = Array.isArray(response) ? response.map(String) : [];
    setWishlistIds(ids);
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    setWishlistIds([]); // Fallback to empty array
  } finally {
    setIsLoading(false);
  }
}, []);

  // Add to wishlist
  const addToWishlist = useCallback(async (tutorId) => {
    try {
      const id = String(tutorId);
      await studentService.addToWishlist(id);
      setWishlistIds(prev => [...(prev || []), id]); // Safe array spread
    } catch (error) {
      console.error('Add to wishlist failed:', error);
      throw error;
    }
  }, []);

  // Remove from wishlist
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

  

  // Check if tutor is in wishlist
  const isInWishlist = useCallback((tutorId) => {
    return (wishlistIds || []).includes(String(tutorId));
  }, [wishlistIds]);

  // Initial load
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Context value
  const contextValue = {
    wishlistTutors: getWishlistTutors(), // Always returns array
    wishlistIds: wishlistIds || [], // Always returns array
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