import React, { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const localData = localStorage.getItem('tutorWishlist');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('tutorWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (tutor) => {
    setWishlist((prevWishlist) => {
      if (!prevWishlist.some(item => item.id === tutor.id)) {
        return [...prevWishlist, tutor];
      }
      return prevWishlist;
    });
  };

  const removeFromWishlist = (tutorId) => {
    setWishlist((prevWishlist) => prevWishlist.filter(item => item.id !== tutorId));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
