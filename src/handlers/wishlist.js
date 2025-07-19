import { studentService } from '../services/apiService';

// Toggle wishlist status for a tutor
export const handleWishlistToggle = async (e, tutorId, isInWishlist, toast, t) => {
  e.preventDefault();
  e.stopPropagation();

  try {
    if (isInWishlist) {
      await studentService.removeFromWishlist(tutorId);
      toast({
        title: t('wishlistRemoved'),
        description: t('hasBeenRemoved', { context: 'male' }),
      });
    } else {
      await studentService.addToWishlist(tutorId);
      toast({
        title: t('wishlistAdded'),
        description: t('hasBeenAdded', { context: 'male' }),
      });
    }
    return !isInWishlist; // Return new wishlist state
  } catch (error) {
    toast({
      title: t('error'),
      description: error.message || t('wishlistError'),
      variant: 'destructive',
    });
    throw error;
  }
};

// Fetch wishlist status (optional, if you need to check if tutor is in wishlist)
export const checkWishlistStatus = async (tutorId, toast, t) => {
  try {
    const profile = await studentService.getProfile();
    const wishlist = profile.userdata?.wishlist?.teacher_ids || [];
    return wishlist.includes(tutorId);
  } catch (error) {
    toast({
      title: t('error'),
      description: error.message || t('wishlistFetchError'),
      variant: 'destructive',
    });
    return false;
  }
};