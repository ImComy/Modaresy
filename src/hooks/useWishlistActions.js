import { useCallback } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export const useWishlistLogic = (tutor) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Safe tutor ID extraction
  const tutorId = String(tutor?._id || tutor?.id || '');

  const handleWishlistToggle = useCallback(async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!tutorId) {
      toast({
        title: 'Error',
        description: 'Invalid tutor information',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isInWishlist(tutorId)) {
        await removeFromWishlist(tutorId);
        toast({
          title: t('removed'),
          description: t('tutorRemovedFromWishlist'),
        });
      } else {
        await addToWishlist(tutorId);
        toast({
          title: t('added'),
          description: t('tutorAddedToWishlist'),
        });
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [tutorId, isInWishlist, addToWishlist, removeFromWishlist, toast, t]);

  return {
    tutorId,
    isInWishlist: isInWishlist(tutorId),
    handleWishlistToggle
  };
};